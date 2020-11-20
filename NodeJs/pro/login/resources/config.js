
module.exports =
    config = {
        typingDNA: {
            apiKey: 'Your apiKey',
            apiSecret: 'Your apiSecret',
            apiServer: 'api.typingdna.com',
        },
        someprivatekey: '@2mws9~&%?+RN',
        sessionSecret: 'asdkjkfh63ryfsdgcqg87w4rf7gasydi',
        options: {
            confidence: {
                high: 10,
                medium: 3,
            },
            autoEnrollThreshold: 90,
            scoreThreshold: {
                high: 80,
                medium: 50
            },
            scoreColor: {
                high: '#45bb64', // green
                medium: '#f8cd00', // orange
                low: '#c70000', // red
            }
        }
    };
