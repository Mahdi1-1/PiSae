package com.projectmentor.communityservice.marketplace.service;

import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.gridfs.model.GridFSUploadOptions;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {

    private final MongoTemplate mongoTemplate;
    private final GridFsOperations gridFsOperations;

    private static final String CV_BUCKET = "cv_files";

    public String storeFile(MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        
        Document metadata = new Document();
        metadata.put("originalFilename", file.getOriginalFilename());
        metadata.put("contentType", file.getContentType());
        metadata.put("size", file.getSize());
        
        GridFSUploadOptions options = new GridFSUploadOptions().metadata(metadata);
        
        ObjectId fileId = GridFSBuckets.create(mongoTemplate.getDb(), CV_BUCKET)
                .uploadFromStream(fileName, file.getInputStream(), options);
        
        log.info("File stored in GridFS: {} with id: {}", fileName, fileId.toString());
        
        return fileName;
    }

    public GridFSFile getFile(String fileName) {
        String decodedFileName = URLDecoder.decode(fileName, StandardCharsets.UTF_8);
        List<String> candidates = List.of(
                decodedFileName,
                Normalizer.normalize(decodedFileName, Normalizer.Form.NFC),
                Normalizer.normalize(decodedFileName, Normalizer.Form.NFD)
        );

        log.info("Searching GridFS for CV fileName='{}'. decoded='{}'. candidates={}", fileName, decodedFileName, candidates);

        for (String candidate : candidates) {
            GridFSFile gridFSFile = GridFSBuckets.create(mongoTemplate.getDb(), CV_BUCKET)
                    .find(new Document("filename", candidate)).first();
            if (gridFSFile != null) {
                log.info("Found CV in GridFS for filename='{}'.", candidate);
                return gridFSFile;
            }
            log.debug("GridFS lookup failed for candidate filename='{}'.", candidate);
        }

        log.warn("CV file not found in GridFS for any candidate of '{}'.", decodedFileName);
        return null;
    }

    public byte[] getFileBytes(String fileName) throws IOException {
        GridFSFile gridFSFile = getFile(fileName);
        if (gridFSFile == null) {
            throw new RuntimeException("File not found: " + fileName);
        }

        try (InputStream inputStream = GridFSBuckets.create(mongoTemplate.getDb(), CV_BUCKET)
                .openDownloadStream(gridFSFile.getObjectId())) {
            return inputStream.readAllBytes();
        }
    }

    public String extractTextFromCv(String fileName) {
        String candidateFileName = fileName;
        int queryIndex = candidateFileName.indexOf('?');
        if (queryIndex >= 0) {
            candidateFileName = candidateFileName.substring(0, queryIndex);
        }
        int lastSlashIndex = candidateFileName.lastIndexOf('/');
        if (lastSlashIndex >= 0) {
            candidateFileName = candidateFileName.substring(lastSlashIndex + 1);
        }

        GridFSFile gridFSFile = getFile(candidateFileName);
        if (gridFSFile == null) {
            return null;
        }

        String filename = gridFSFile.getFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".pdf")) {
            return null;
        }

        try (InputStream inputStream = GridFSBuckets.create(mongoTemplate.getDb(), CV_BUCKET)
                .openDownloadStream(gridFSFile.getObjectId())) {
            byte[] pdfBytes = inputStream.readAllBytes();
            try (PDDocument document = Loader.loadPDF(pdfBytes)) {
                PDFTextStripper stripper = new PDFTextStripper();
                return stripper.getText(document);
            }
        } catch (IOException ex) {
            log.warn("Unable to extract text from CV '{}'.", fileName, ex);
            return null;
        }
    }

    public void deleteFile(String fileName) {
        GridFSFile gridFSFile = GridFSBuckets.create(mongoTemplate.getDb(), CV_BUCKET)
                .find(new Document("filename", fileName)).first();
        
        if (gridFSFile != null) {
            GridFSBuckets.create(mongoTemplate.getDb(), CV_BUCKET).delete(gridFSFile.getObjectId());
            log.info("File deleted from GridFS: {}", fileName);
        }
    }
}
