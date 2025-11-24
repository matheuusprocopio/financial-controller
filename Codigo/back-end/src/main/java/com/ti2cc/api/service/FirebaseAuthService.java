package com.ti2cc.api.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.ti2cc.api.factory.FirebaseFactory;
import com.ti2cc.api.model.User;

public class FirebaseAuthService {

    private final FirebaseAuth firebaseAuth;
    private boolean isInitialized = false;

    public FirebaseAuthService() {
        FirebaseAuth auth = null;
        try {
            auth = FirebaseFactory.getFirebaseAuth();
            isInitialized = true;
        } catch (Exception e) {
            System.err.println("AVISO: FirebaseAuthService não pode ser inicializado: " + e.getMessage());
            isInitialized = false;
        }
        this.firebaseAuth = auth;
    }

    public boolean isInitialized() {
        return isInitialized && firebaseAuth != null;
    }

    public FirebaseToken verifyIdToken(String idToken) throws FirebaseAuthException {
        if (!isInitialized()) {
            throw new RuntimeException("Firebase não está inicializado. Configure as credenciais no .env");
        }
        return firebaseAuth.verifyIdToken(idToken);
    }
    public User extractUserFromToken(FirebaseToken decodedToken) {
        String email = decodedToken.getEmail();
        String name = decodedToken.getName();
        
        if (name == null || name.isEmpty()) {
            // Se não tem nome no token, usa o email sem o domínio como nome
            if (email != null && email.contains("@")) {
                name = email.substring(0, email.indexOf("@"));
            } else {
                name = "User";
            }
        }

        // Retorna um User sem ID (será criado/atualizado no banco se necessário)
        return new User(null, name, email);
    }


    public String getEmailFromToken(String idToken) throws FirebaseAuthException {
        FirebaseToken decodedToken = verifyIdToken(idToken);
        return decodedToken.getEmail();
    }
}

