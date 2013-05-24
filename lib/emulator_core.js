// (C) 2012 Anton Zemlyanov
//
// Emulator allows test bots for "free" using real price data
//

var EmulatorMarket = require('./emulator_market.js');

function Emulator() {
    var self = this;
    self.markets = {};
    self.customerRefs = {};
}

// emulator control interface
Emulator.prototype.enableBetEmulatorForMarket = function(marketId) {
    var self = this;
    if(!self.markets[marketId]) {
        self.markets[marketId] = new EmulatorMarket(marketId);
        self.markets[marketId].emulator = self;
    }
    self.markets[marketId].isEmulated = true;
}
    
Emulator.prototype.disableBetEmulatorForMarket = function(marketId) {
    var self = this;
    if(self.markets[marketId]) {
        self.markets[marketId].isEmulated = false;
    }
}
        
Emulator.prototype.isMarketUsingBetEmulator = function(marketId) {
    var self = this;
    if(!self.markets[marketId])
        return false;
    return self.markets[marketId].isEmulated;
}

Emulator.prototype.onListMarketBook = function(result) {
    var self = this;

    if (!result)
        return false;
        
    for(var i=0; i<result.length; ++i) {
        var marketItem = result[i];
    }
}

// Process placeOrders API call
Emulator.prototype.placeOrders = function(req, res, cb) {
    var self = this;
    
    // mandatory parameters
    var marketId = req.params.marketId;
    var instructions = req.params.instructions;
    if(!marketId || !instructions || instructions.length<1) {
        sendErrorResponse(res, -32602, "DSC-018");
        return;
    }
    
    // check marketId
    var market = self.markets[marketId];
    if(!self.isMarketUsingBetEmulator(marketId) || !market) {
        var ex = {
            "errorDetails": "market id passed is invalid",
            "errorCode": "INVALID_INPUT_DATA"
        };
        sendExceptionResponse(res, -32099, "ANGX-0002", ex);
        cb(null);
        return;
    }
    
    market.placeOrders(req, res, function() {
        cb(null);
    });
}

// Process replaceOrders API call
Emulator.prototype.replaceOrders = function(req, res, cb) {
    var self = this;
    
    // mandatory parameters
    var marketId = req.params.marketId;
    var instructions = req.params.instructions;
    if(!marketId || !instructions || instructions.length<1) {
        sendErrorResponse(res, -32602, "DSC-018");
        cb(null);
        return;
    }
    
    // check marketId
    var market = self.markets[marketId];
    if(!self.isMarketUsingBetEmulator(marketId) || !!market) {
        var ex = {
            "errorDetails": "market id passed is invalid",
            "errorCode": "INVALID_INPUT_DATA"
        };
        sendExceptionResponse(res, -32099, "ANGX-0002", ex);
        cb(null);
        return;
    }
    
    market.replaceOrders(req, res, function() {
        cb(null);
    });
}

// Process updateOrders API call
Emulator.prototype.updateOrders = function(req, res, cb) {
    var self = this;

    // mandatory parameters
    var marketId = req.params.marketId;
    var instructions = req.params.instructions;
    if(!marketId || !instructions || instructions.length<1) {
        sendErrorResponse(res, -32602, "DSC-018");
        cb(null);
        return;
    }
    
    // check marketId
    var market = self.markets[marketId];
    if(!self.isMarketUsingBetEmulator(marketId) || !!market) {
        var ex = {
            "errorDetails": "market id passed is invalid",
            "errorCode": "INVALID_INPUT_DATA"
        };
        sendExceptionResponse(res, -32099, "ANGX-0002", ex);
        cb(null);
        return;
    }
    
    market.updateOrders(req, res, function() {
        cb(null);
    });
}

// Process cancelOrders API call
Emulator.prototype.cancelOrders = function(req, res, cb) {
    var self = this;

    // mandatory parameters
    var marketId = req.params.marketId;
    var instructions = req.params.instructions;
    if(!marketId || !instructions || instructions.length<1) {
        sendErrorResponse(res, -32602, "DSC-018");
        cb(null);
        return;
    }
    
    // check marketId
    var market = self.markets[marketId];
    if(!self.isMarketUsingBetEmulator(marketId) || !!market) {
        var ex = {
            "errorDetails": "market id passed is invalid",
            "errorCode": "INVALID_INPUT_DATA"
        };
        sendExceptionResponse(res, -32099, "ANGX-0002", ex);
        cb(null);
        return;
    }
    
    market.cancelOrders(req, res, function() {
        cb(null);
    });
}

// Unknown method
Emulator.prototype.unknownMethod = function(req, res, cb) {
    var self = this;

    sendErrorResponse(res, -32601, "Method not found");
    cb(null);
}

// Bad request
Emulator.prototype.badRequest = function(req, res, cb) {
    var self = this;

    sendErrorResponse(res, -32700, "Parse error");
    cb(null);
}

// Send valid JSON-RPC response
function sendResponse(res, result) {
    result.isEmulator = "true";
    var response = {
        jsonrpc:"2.0",
        id: res.id,
        result: result,
    };
    res.jsonRpcResponseBody = JSON.stringify(response);
    //console.log(res.jsonRpcResponseBody);
}

// Send JSON-RPC error
function sendErrorResponse(res, code, message) {
    var response = {
        jsonrpc:"2.0",
        id: res.id,
        error: { 
            code: code,
            message: message,
            data: { isEmulator: "true" }
        }
    };
    res.jsonRpcResponseBody = JSON.stringify(response);
    //console.log(res.jsonRpcResponseBody);
}

// Send JSON-RPC exception (error with "data" explaining problem)
function sendExceptionResponse(res, code, message, exception) {
    exception.requestUUID = req.uuid;
    var response = {
        jsonrpc:"2.0",
        id: res.id,
        error: { 
            code: code,
            message: message,
            data: {
                exceptionname: "APINGException",
                APINGException: exception,
                isEmulator: "true"
            }
        }
    };
    res.jsonRpcResponseBody = JSON.stringify(response);
    //console.log(res.jsonRpcResponseBody);
}

// Emulator is a singleton object
var emulator = module.exports = new Emulator();