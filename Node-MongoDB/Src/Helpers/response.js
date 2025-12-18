module.exports = {
    reply: async function (res, errorcode, isError, message, data) {
        return res.status(errorcode).json({
            msg: message,
            error: isError,
            statusCode: errorcode,
            data: data
        });
    }
};
