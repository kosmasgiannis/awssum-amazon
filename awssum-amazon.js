// --------------------------------------------------------------------------------------------------------------------
//
// amazon.js - the base class for all Amazon Web Services
//
// Copyright (c) 2011 AppsAttic Ltd - http://www.appsattic.com/
// Written by Andrew Chilton <chilts@appsattic.com>
//
// License: http://opensource.org/licenses/MIT
//
// --------------------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------------------
// requires

var util = require("util");

// our own library
var awssum = require("awssum");
var awsSignatureV2 = require('./lib/aws-signature-v2.js');
var awsSignatureV4 = require('./lib/aws-signature-v4.js');

// --------------------------------------------------------------------------------------------------------------------
// constants

var MARK = 'amazon: ';

var US_EAST_1      = 'us-east-1';
var US_WEST_1      = 'us-west-1';
var US_WEST_2      = 'us-west-2';
var EU_WEST_1      = 'eu-west-1';
var AP_SOUTHEAST_1 = 'ap-southeast-1';
var AP_SOUTHEAST_2 = 'ap-southeast-2';
var AP_NORTHEAST_1 = 'ap-northeast-1';
var SA_EAST_1      = 'sa-east-1';
var US_GOV_WEST_1  = 'us-gov-west-1'; // See : http://aws.amazon.com/about-aws/globalinfrastructure/

var Region = {
    US_EAST_1      : true,
    US_WEST_1      : true,
    US_WEST_2      : true,
    EU_WEST_1      : true,
    AP_SOUTHEAST_1 : true,
    AP_SOUTHEAST_2 : true,
    AP_NORTHEAST_1 : true,
    SA_EAST_1      : true,
    US_GOV_WEST_1  : true,
};

// --------------------------------------------------------------------------------------------------------------------
// constructor

var Amazon = function(opts) {
    var self = this;
    var accessKeyId, secretAccessKey, awsAccountId, _awsAccountId, region, token;

    // call the superclass for initialisation
    Amazon.super_.call(this, opts);

    // check that we have each of these values
    if ( ! opts.accessKeyId ) {
        throw MARK + 'accessKeyID is required';
    }
    if ( ! opts.secretAccessKey ) {
        throw MARK + 'secretAccessKey is required';
    }
    if ( ! opts.region ) {
        throw MARK + 'region is required';
    }

    // set the local vars so the functions below can close over them
    accessKeyId         = opts.accessKeyId;
    secretAccessKey     = opts.secretAccessKey;
    region              = opts.region;

    // for services which can use the Simple Token Service (STS)
    if ( opts.token ) {
        token = opts.token;
    }

    // getters and setters
    self.setAccessKeyId     = function(newStr) { accessKeyId = newStr; };
    self.setSecretAccessKey = function(newStr) { secretAccessKey = newStr; };
    self.setAwsAccountId    = function(newStr) {
        var m;
        if ( m = newStr.match(/^(\d{4})(\d{4})(\d{4})$/) ) {
            awsAccountId = newStr;
            _awsAccountId = m[1] + '-' + m[2] + '-' + m[3];
        }
        else if ( m = newStr.match(/^\d{4}-\d{4}-\d{4}$/) ) {
            _awsAccountId = newStr;
            awsAccountId = newStr.replace(/-/g, '');
        }
        else {
            throw MARK + "invalid awsAccountId, must be '111122223333' or '1111-2222-3333'";
        }
    };

    self.accessKeyId     = function() { return accessKeyId;     };
    self.secretAccessKey = function() { return secretAccessKey; };
    self.region          = function() { return region;          };
    self.awsAccountId    = function() { return awsAccountId;    };
    self._awsAccountId   = function() { return _awsAccountId;   };
    self.token           = function() { return token;           };

    // use the setAwsAccountId setter (which contains extra logic)
    if ( opts.awsAccountId ) {
        self.setAwsAccountId(opts.awsAccountId);
    }

    return self;
};

// inherit from AwsSum
util.inherits(Amazon, awssum.AwsSum);

// --------------------------------------------------------------------------------------------------------------------
// functions to be overriden by inheriting class

// see ../awssum.js for more details

Amazon.prototype.extractBody = function() {
    // most amazon services return XML, so override in inheriting classes if needed
    return 'xml';
};

// --------------------------------------------------------------------------------------------------------------------
// functions to be overriden by inheriting (Amazon) class

// function version()              -> string (the version of this service)
// function signatureVersion()     -> string (the signature version used)
// function signatureMethod()      -> string (the signature method used)
// function strToSign(options)     -> string (the string that needs to be signed)
// function signature(strToSign)   -> string (the signature itself)
// function addSignature(options, signature) -> side effect, adds the signature to the 'options'

// --------------------------------------------------------------------------------------------------------------------
// create 2 other versions of the Amazon constructor for v2 and v4 signatures

// This service uses (defaults to) the AWS Signature v2.
var AmazonSignatureV2 = function(opts) {
    var self = this;

    // call the superclass for initialisation
    AmazonSignatureV2.super_.call(self, opts);

    return self;
};
util.inherits(AmazonSignatureV2, Amazon);

AmazonSignatureV2.prototype.signatureVersion = awsSignatureV2.signatureVersion;
AmazonSignatureV2.prototype.signatureMethod  = awsSignatureV2.signatureMethod;
AmazonSignatureV2.prototype.strToSign        = awsSignatureV2.strToSign;
AmazonSignatureV2.prototype.signature        = awsSignatureV2.signature;
AmazonSignatureV2.prototype.addSignature     = awsSignatureV2.addSignature;
AmazonSignatureV2.prototype.addCommonOptions = awsSignatureV2.addCommonOptions;

// This service uses (defaults to) the AWS Signature v4.
var AmazonSignatureV4 = function(opts) {
    var self = this;

    // call the superclass for initialisation
    AmazonSignatureV4.super_.call(self, opts);

    return self;
};
util.inherits(AmazonSignatureV4, Amazon);

AmazonSignatureV4.prototype.signatureVersion = awsSignatureV4.signatureVersion;
AmazonSignatureV4.prototype.signatureMethod  = awsSignatureV4.signatureMethod;
AmazonSignatureV4.prototype.strToSign        = awsSignatureV4.strToSign;
AmazonSignatureV4.prototype.signature        = awsSignatureV4.signature;
AmazonSignatureV4.prototype.addSignature     = awsSignatureV4.addSignature;
AmazonSignatureV4.prototype.addCommonOptions = awsSignatureV4.addCommonOptions;
AmazonSignatureV4.prototype.contentType      = awsSignatureV4.contentType;

// --------------------------------------------------------------------------------------------------------------------
// exports

// constants
exports.US_EAST_1      = US_EAST_1;
exports.US_WEST_1      = US_WEST_1;
exports.US_WEST_2      = US_WEST_2;
exports.EU_WEST_1      = EU_WEST_1;
exports.AP_SOUTHEAST_1 = AP_SOUTHEAST_1;
exports.AP_SOUTHEAST_2 = AP_SOUTHEAST_2;
exports.AP_NORTHEAST_1 = AP_NORTHEAST_1;
exports.US_GOV_WEST_1  = US_GOV_WEST_1;
exports.SA_EAST_1      = SA_EAST_1;

// object constructor
exports.Amazon = Amazon;
exports.AmazonSignatureV2 = AmazonSignatureV2;
exports.AmazonSignatureV4 = AmazonSignatureV4;

// --------------------------------------------------------------------------------------------------------------------
