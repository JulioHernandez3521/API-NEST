export  const fileFilter = (req: Express.Request, file:Express.Multer.File, callback: Function) => {
    if (!file) return callback(new Error("Files is empty"), false);

    const fileExtension = file.mimetype.split("/")[1];
    const validExtension = ['jpg','jpeg','png','gif','svg'];

    if(validExtension.includes(fileExtension)) return callback(null,true);
    // this line is just to print some information in the logs
    //new Error("Somthing is wrong :(");
    callback(null,false);
}