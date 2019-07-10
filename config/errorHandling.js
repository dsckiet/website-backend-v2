//instead of using try{} catch(e){} everywhere for async functions we wrap them in a higher order function which catches the error and passes along to next middleware

//catchErrors is a function that takes any middleware which a route executes
module.exports.catchErrors = middlewareFunction => {
    //catchErrors return the middlewareFunction wrapped inside an anonymous function
    return (req, res, next) => {
        //calling the passed middleware function
        //if there is an error then it catches it and passes on next()
        middlewareFunction(req, res, next).catch(err => {
            //pass this error for display
            next(err);
        });
    };
};

//for routes which are not found
module.exports.notFoundError = (req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
};

module.exports.sendErrors = (err, req, res, next) => {
    const errorDetailsToSend = {
        message: err.message,
        status: err.status || 500,
        error: true
    };
    //logging error for backend console
    console.log(errorDetailsToSend);
    console.log(err.stack);
    //sending error to frontend
    res.status(err.status || 500).json(errorDetailsToSend);
};
