module.exports = {
    "port": 8888,
    "appEndpoint": "http://localhost:8888",
    "apiEndpoint": "http://localhost:8888",
    "globalRoutePrefix": "/api",
    // Replace authTokenHMACKey with your HMAC-SHA512 secret key - 64 bytes in base64
    // CAUTION: It's not a secure random key, It's only for demo project !!! Please change it.
    "authTokenHMACKey": "Z2xPlgJkZ27tI/13qXs0lj9NR3xAjrD1ftnEARfrsknTQjDlzGLAmtiwH23Z5uZYhYwGjnfwmTHEJG4t1pnzXQ==",
    // Replace authTokenSymKey256 with your symmetric encryption key - 32 bytes in base64
    // CAUTION: It's not a secure random key, It's only for demo project !!! Please change it.
    "authTokenSymKey256": "QZBo1HUfpIwbRuZd/uQtjxrDvWQFMwtaaHO6KgKsegY=",
    // Replace authTokenIV16 with your symmetric encryption mode IV - 16 bytes in base64
    // CAUTION: It's not a secure random key, It's only for demo project !!! Please change it.
    "authTokenIV16": "5aytyLXPvE1NaicTfNFe3Q==",
    // You can change encryption suit
    "authTokenSymAlg": "aes-256-cbc",
    "environment": "dev",
    "permissionLevels": {
        "ADMIN": 1,        
        "NORMAL_USER": 2
    },
};
