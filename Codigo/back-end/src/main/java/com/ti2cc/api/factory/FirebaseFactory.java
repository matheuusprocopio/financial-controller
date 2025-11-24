package com.ti2cc.api.factory;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import io.github.cdimascio.dotenv.Dotenv;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

public class FirebaseFactory {
    private static FirebaseAuth firebaseAuth;
    private static final Dotenv dotenv = Dotenv.configure()
            .directory("./")
            .ignoreIfMissing()
            .load();

    public static FirebaseAuth getFirebaseAuth() {
        if (firebaseAuth == null) {
            try {
                initializeFirebase();
            } catch (Exception e) {
                System.err.println("AVISO: Firebase não foi inicializado: " + e.getMessage());
                System.err.println("As funcionalidades de autenticação podem não funcionar corretamente.");
                throw new RuntimeException("Firebase não está configurado. Configure FIREBASE_SERVICE_ACCOUNT_JSON ou GOOGLE_APPLICATION_CREDENTIALS", e);
            }
        }
        return firebaseAuth;
    }

    private static void initializeFirebase() {
        try {
            // Verifica se o Firebase já foi inicializado
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseOptions.Builder optionsBuilder = FirebaseOptions.builder();

                // Tenta usar service account JSON se fornecido
                String serviceAccountJson = dotenv.get("FIREBASE_SERVICE_ACCOUNT_JSON");
                if (serviceAccountJson != null && !serviceAccountJson.isEmpty()) {
                    try {
                        InputStream serviceAccount = new ByteArrayInputStream(
                                serviceAccountJson.getBytes("UTF-8"));
                        GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);
                        optionsBuilder.setCredentials(credentials);
                    } catch (Exception e) {
                        System.err.println("Erro ao carregar credenciais do Firebase: " + e.getMessage());
                        // Tenta usar variáveis de ambiente individuais
                        initializeFromEnvVars(optionsBuilder);
                    }
                } else {
                    // Usa variáveis de ambiente individuais
                    initializeFromEnvVars(optionsBuilder);
                }

                // Project ID
                String projectId = dotenv.get("FIREBASE_PROJECT_ID");
                if (projectId != null && !projectId.isEmpty()) {
                    optionsBuilder.setProjectId(projectId);
                }

                FirebaseOptions options = optionsBuilder.build();
                FirebaseApp.initializeApp(options);
            }

            firebaseAuth = FirebaseAuth.getInstance();
        } catch (Exception e) {
            throw new RuntimeException("Falha ao inicializar Firebase: " + e.getMessage(), e);
        }
    }

    private static void initializeFromEnvVars(FirebaseOptions.Builder optionsBuilder) throws IOException {
        // Alternativa: inicializar com variáveis de ambiente
        // Isso pode ser usado se você configurar GOOGLE_APPLICATION_CREDENTIALS
        String credentialsPath = dotenv.get("GOOGLE_APPLICATION_CREDENTIALS");
        if (credentialsPath != null && !credentialsPath.isEmpty()) {
            try {
                // Tenta como caminho do sistema de arquivos primeiro
                java.io.File credentialsFile = new java.io.File(credentialsPath);
                if (credentialsFile.exists()) {
                    try (InputStream serviceAccount = new java.io.FileInputStream(credentialsFile)) {
                        GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);
                        optionsBuilder.setCredentials(credentials);
                        return; // Sucesso, sai do método
                    }
                }
                
                // Se não encontrou como arquivo, tenta como resource do classpath
                try (InputStream serviceAccount = FirebaseFactory.class.getClassLoader()
                        .getResourceAsStream(credentialsPath)) {
                    if (serviceAccount != null) {
                        GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);
                        optionsBuilder.setCredentials(credentials);
                        return; // Sucesso, sai do método
                    }
                }
            } catch (Exception e) {
                System.err.println("Erro ao carregar credenciais de " + credentialsPath + ": " + e.getMessage());
            }
        }
        
        // Tenta carregar service-account-key.json do diretório atual (útil para Docker)
        String[] possiblePaths = {"./service-account-key.json", "service-account-key.json", "/app/service-account-key.json"};
        for (String path : possiblePaths) {
            try {
                java.io.File credentialsFile = new java.io.File(path);
                if (credentialsFile.exists()) {
                    try (InputStream serviceAccount = new java.io.FileInputStream(credentialsFile)) {
                        GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);
                        optionsBuilder.setCredentials(credentials);
                        System.out.println("Credenciais do Firebase carregadas de: " + path);
                        return; // Sucesso, sai do método
                    }
                }
            } catch (Exception e) {
                // Continua tentando outros caminhos
            }
        }
        
        // Se não encontrou credenciais, tenta usar Application Default Credentials
        // Útil para ambientes como Google Cloud onde as credenciais são fornecidas automaticamente
        try {
            GoogleCredentials credentials = GoogleCredentials.getApplicationDefault();
            optionsBuilder.setCredentials(credentials);
        } catch (Exception e) {
            System.err.println("Não foi possível inicializar com Application Default Credentials: " + e.getMessage());
            throw new IOException("Credenciais do Firebase não encontradas. Configure FIREBASE_SERVICE_ACCOUNT_JSON ou GOOGLE_APPLICATION_CREDENTIALS");
        }
    }
}

