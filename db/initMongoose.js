var mongoose = require('mongoose');

var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);

var assert = require('assert');
var util = require('util');

var cfenv = require('cfenv');

var mongodb_con = 
   {
    "credentials": {
     "ca_certificate_base64": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURnekNDQW11Z0F3SUJBZ0lFV1V2bFRUQU5CZ2txaGtpRzl3MEJBUTBGQURCRE1VRXdQd1lEVlFRREREaHQKWVd0emVXMHVhRzl1ZEdGeVFHZHRZV2xzTG1OdmJTMHpNalZoT0RJellXSXpNVEk1WkRKaU1EazRNalkwTWpVMwpaVEUwT1dRM1pEQWVGdzB4TnpBMk1qSXhOVFF5TURWYUZ3MHpOekEyTWpJeE5UQXdNREJhTUVNeFFUQS9CZ05WCkJBTU1PRzFoYTNONWJTNW9iMjUwWVhKQVoyMWhhV3d1WTI5dExUTXlOV0U0TWpOaFlqTXhNamxrTW1Jd09UZ3kKTmpReU5UZGxNVFE1WkRka01JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBdnNmQwpBZGJBVEdIbHB1M1VOVU8zSjVwZnRYSGxQYk5nUEVTQ2pMZUpnQTFLZ0p6RzE4RnNiaTVzdS9nYnJkclFMWmVPClE5ZWVMV096SGdEQ0dzWmFWWGlNOGliaDFZVmZZYWlUeGRhT3I1bWtGTEM1YXduR1JwZkNrVWFXK0o2OEhESk0KQTl2OUJaMkNIemZaQ0p5R1NkakVMem1HUXE0QTZhR2kxZUloeEpwRnFTeEhOWGZFbSt0NjIxZWdoS2VlbjdmMAp6MEozS0d5ZWF0Q2NwSEoxZWdoZ1B4RDFxcGRWNEpmcEVaTWZFQlBuN3BJOGx4VkNsMlVhQ3JoaVNxSDFWbWVaClllVEFlMEZ5aVo3S1lrRExlU1VtKzB1VXlpL0VCL2h3bHhUaHBxbXp5d2tyOEEyK05SSmVLMjVmdmFza0xDM20KMkVxS1VEeTZLU1JReFpKQW53SURBUUFCbzM4d2ZUQWRCZ05WSFE0RUZnUVVTSndpWHZQVFpsRWVPeTJIZkdnNApISm5NRHhBd0RnWURWUjBQQVFIL0JBUURBZ0lFTUIwR0ExVWRKUVFXTUJRR0NDc0dBUVVGQndNQkJnZ3JCZ0VGCkJRY0RBakFNQmdOVkhSTUVCVEFEQVFIL01COEdBMVVkSXdRWU1CYUFGRWljSWw3ejAyWlJIanN0aDN4b09CeVoKekE4UU1BMEdDU3FHU0liM0RRRUJEUVVBQTRJQkFRQ2ZHR3ZFYWlpYTdUU1VmY0Z4MUFnckh4N3hmSitUNkpraQoxcWtCQ2Zya081YVk2eFhEM0g5UmZyZzVoK3IxV1RQZy9qajdqbDZaNGUwZmk0R212RmpzdC8zVmRIWnIrSzlaCkxEU0dFME0zeFN0TEVRWmZXaThQUTFDbmh2bEYxeXRrUHhMUHM0WTM3T1lkdmsrb0RSZEZReDJXQWZUUlpFYlEKWkd4bmJEZXA0ZEl0SEZ6RWlyV1FZQ1JyMVZCemY2N2dzSFAzNEZCdFl6azVSNlgvR0t5R2RTVUttTnRQRTlHcApxQkVwUHhBZFhCUWFrL1ZxUmxiOFBpc2NwbzN2NURCMHkrYlkxQm5yMDJuMHNCUXhlRjNjQnU5emFGWFdGUklGCjY0Q1MxNHBCNENmODUzd1I2cUFZWWJOYmpSZEpkeGxmTEwvNXVnbWZFUTFZOVBGYUwvaVEKLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=",
     "db_type": "mongodb",
     "deployment_id": "594be54419a0ca001000000a",
     "maps": [],
     "name": "bmix-dal-yp-3a56a41f-67cf-4565-9dce-90f83c445666",
     "uri": "mongodb://admin:HDWTXWJATKGZBRME@sl-us-south-1-portal.0.dblayer.com:17379,sl-us-south-1-portal.1.dblayer.com:17379/admin?ssl=true",
     "uri_cli": "mongo --ssl --sslAllowInvalidCertificates sl-us-south-1-portal.0.dblayer.com:17379/admin -u admin -p HDWTXWJATKGZBRME"
    },
    "label": "compose-for-mongodb",
    "name": "my-compose-for-mongodb-service",
    "plan": "Standard",
    "provider": null,
    "syslog_drain_url": null,
    "tags": [
     "big_data",
     "data_management",
     "ibm_created"
    ],
    "volume_mounts": []
   }


var appenv = cfenv.getAppEnv();
var services = appenv.services;
var mongodb_services = services["compose-for-mongodb"];
// assert(!util.isUndefined(mongodb_services), "Must be bound to compose-for-mongodb services");
var credentials = mongodb_con.credentials;
var ca = [mongodb_con.ca_certificate_base64];


var models = require('require_tree').require_tree('./db/models/');

module.exports = function() {

    mongoose.connection.on('open', function() {
        console.log('Connected to mongo server!');
    });

    mongoose.connection.on('error', function(err) {
        console.log('Could not connect to mongo server!');
        console.log(err.message);
    });

    try {
        mongoose.connect("mongodb://lolkek:cheburek@ds139322.mlab.com:39322/kek",  ['mohd'],
            function(err, db) {
                if (err) {
                    console.log(err);
                } else {
                    return db;
                    // mongoose.useDb("chat");
                }
            });
    } catch (err) {
        console.log(err);
    }
};