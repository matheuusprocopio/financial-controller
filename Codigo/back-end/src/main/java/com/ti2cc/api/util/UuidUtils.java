package com.ti2cc.api.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

public class UuidUtils {
    //esse namespace é um padrao de conversão do firebase
    private static final String NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    public static UUID fromFirebaseUid(String firebaseUid) {
        try {
            String combined = firebaseUid + NAMESPACE;
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hash = md.digest(combined.getBytes(StandardCharsets.UTF_8));

            hash[6] &= 0x0f;  
            hash[6] |= 0x40;   
            hash[8] &= 0x3f;  
            hash[8] |= 0x80;  
            
            long msb = 0;
            long lsb = 0;
            for (int i = 0; i < 8; i++) {
                msb = (msb << 8) | (hash[i] & 0xff);
            }
            for (int i = 8; i < 16; i++) {
                lsb = (lsb << 8) | (hash[i] & 0xff);
            }
            return new UUID(msb, lsb);
        } catch (NoSuchAlgorithmException e) {
            System.err.println("MD5 not available, using random UUID: " + e.getMessage());
            return UUID.randomUUID();
        }
    }
}
