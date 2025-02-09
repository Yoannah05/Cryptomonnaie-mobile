CREATE TABLE Cryptomonnaie(
   id_cryptomonnaie SERIAL,
   nom VARCHAR(50) ,
   valeur_actuelle MONEY,
   PRIMARY KEY(id_cryptomonnaie)
);

CREATE TABLE Variation(
   id_valeur SERIAL,
   valeur MONEY,
   date_variation TIMESTAMP,
   PRIMARY KEY(id_valeur)
);

CREATE TABLE Utilisateur(
   id_utilisateur SERIAL,
   identifiant VARCHAR(50) ,
   nom VARCHAR(50) ,
   prenom VARCHAR(50) ,
   solde MONEY,
   PRIMARY KEY(id_utilisateur)
);

CREATE TABLE Transaction_Monnaie(
   id_transaction_monnaie SERIAL,
   valeur MONEY,
   is_entree BOOLEAN,
   is_valide BOOLEAN,
   id_utilisateur INTEGER NOT NULL,
   PRIMARY KEY(id_transaction_monnaie),
   FOREIGN KEY(id_utilisateur) REFERENCES Utilisateur(id_utilisateur)
);

CREATE TABLE Transaction_Crypto(
   id_transaction_crypto SERIAL,
   valeur NUMERIC(15,5)  ,
   is_entree BOOLEAN,
   PRIMARY KEY(id_transaction_crypto)
);

CREATE TABLE Historique_Individu(
   id_historique SERIAL,
   date_historique TIMESTAMP,
   id_transaction_crypto_init INTEGER,
   id_transaction_monnaie INTEGER,
   id_transaction_crypto_result INTEGER,
   PRIMARY KEY(id_historique),
   FOREIGN KEY(id_transaction_crypto_init) REFERENCES Transaction_Crypto(id_transaction_crypto),
   FOREIGN KEY(id_transaction_monnaie) REFERENCES Transaction_Monnaie(id_transaction_monnaie),
   FOREIGN KEY(id_transaction_crypto_result) REFERENCES Transaction_Crypto(id_transaction_crypto)
);

CREATE TABLE Portefeuille(
   id_porte_feuille SERIAL,
   valeur_actuelle NUMERIC(15,5)  ,
   id_transaction_crypto INTEGER NOT NULL,
   id_cryptomonnaie INTEGER NOT NULL,
   id_utilisateur INTEGER NOT NULL,
   PRIMARY KEY(id_porte_feuille),
   FOREIGN KEY(id_transaction_crypto) REFERENCES Transaction_Crypto(id_transaction_crypto),
   FOREIGN KEY(id_cryptomonnaie) REFERENCES Cryptomonnaie(id_cryptomonnaie),
   FOREIGN KEY(id_utilisateur) REFERENCES Utilisateur(id_utilisateur)
);

CREATE TABLE Variation_Cryptomonnaie(
   id_cryptomonnaie INTEGER,
   id_valeur INTEGER,
   PRIMARY KEY(id_cryptomonnaie, id_valeur),
   FOREIGN KEY(id_cryptomonnaie) REFERENCES Cryptomonnaie(id_cryptomonnaie),
   FOREIGN KEY(id_valeur) REFERENCES Variation(id_valeur)
);
