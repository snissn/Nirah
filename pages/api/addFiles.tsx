import * as Estuary from "../../estuary-js/dist/index.js";
import nextConnect from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import fs from "fs";
import { unlink } from "fs/promises";

import * as path from "path";

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = `./public/uploads/${req.body.id}`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            cb(null, dir);
        },
      filename: (req, file, cb) => cb(null, file.originalname),
    }),
});
  
const apiRoute = nextConnect<NextApiRequest, NextApiResponse>({
    onNoMatch(req, res) {
        res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
    },
});

apiRoute.use(upload.array('files'));

interface MulterRequest extends Request {
    files: any;
    body: {
        id: string;
    };
}

apiRoute.post((req: MulterRequest, res) => {
    let dir = `${process.cwd()}/public/uploads/${req.body.id}`;
    let key = //<insert key here>;
    Estuary.addFiles(dir,req.body.id,key).then((response) => {
        
        //delete the file from the uploads folder
        //fs.unlink(filePath, (err) => { console.log (err) });
        res.status(200).json(response);
    }
    ).catch((error) => {
        res.status(500).json(error);
    }
    );
});

export default apiRoute;

export const config = {
    api: {
        bodyParser: false, // Disallow body parsing, consume as stream
    },
};