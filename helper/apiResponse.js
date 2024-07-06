exports.successResponse = async function (res, msg) {
    var data = {
        status: 1,
        message: msg
    };
    return res.status(200).json(data);
};

exports.successResponseWithData = async function (res, msg, data, count) {
    var resData = {
        status: 1,
        message: msg,
        count: count,
        data: data
    };
    return res.status(200).json(resData);
};

exports.ErrorResponse = async function (res, msg) {
    var data = {
        status: 0,
        message: msg
    };
    return res.status(400).json(data);
};

exports.ErrorResponseWithData = async function (res, msg, data) {
    var resData = {
        status: 0,
        message: msg,
        data: data
    };
    return res.status(400).json(resData);
};

exports.notFoundResponse = async function (res, msg) {
    var data = {
        status: 0,
        message: msg,
    };
    return res.status(404).json(data);
};

exports.validationErrorWithData = async function (res, msg, data) {
    var resData = {
        status: 0,
        message: msg,
        data: data
    };
    return res.status(400).json(resData);
};

exports.validationError = async function (res, msg) {
    var resData = {
        status: 0,
        message: msg
    };
    return res.status(400).json(resData);
};

exports.unauthorizedResponse = async function (res, msg) {
    var data = {
        status: 0,
        message: msg,
    };
    return res.status(401).json(data);
};

