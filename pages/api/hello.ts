// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import sharp from 'sharp';
import busboy, { Busboy } from 'busboy';
import type { NextApiRequest, NextApiResponse } from 'next'
import internal from 'stream';

export const config = {
  api: {
    bodyParser: {
        sizeLimit: '50mb' // Set desired value here
    }
}
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  // console.log(JSON.parse(req.body));
  const myObjRes  = JSON.parse(req.body);
  // console.log(Object.keys(myRes));
  
  // console.log(Object.keys(myRes['0']));
  // console.log(typeof myRes['0'])
  // console.log(myObjRes['bg']);
  const A : Array<number> = Object.values(myObjRes['bg']);
  const B = new Uint8Array(A);
  console.log(B.length, typeof B);

  const myRes = myObjRes['comp'];
  const imgArr : any = Object.keys(myRes)
  // .slice(1)
  .map((idx) =>{
    console.log(idx);
    console.log(new Uint8Array(Object.values(myRes[idx])));
    return {input : new Uint8Array(Object.values(myRes[idx]))};
  })
  console.log(B);
  console.log(imgArr);

    sharp(B)
    .toFile('before.png');
    sharp(B)
    .composite(
      imgArr
    )
    .toFile('a.png',(err,info)=>{
      console.log(err,info)
    });
    // console.log(myRes['0'][i]);
  
    
  
  res.send("hi");
  // const bb : Busboy = busboy({headers:req.headers});
  // req.body
  // // console.log(req.headers);
  // bb.on('file',(name: string, file, mimeType : busboy.FieldInfo)=>{
  //   console.log(name, mimeType, file);
  //   file.on('data', ( data:Buffer )=>{
  //     // console.log(`${name} has data length ${data.length}`)
  //     console.log(data);
  //     res.write(data,'binary');
  //     res.end(null, 'binary');
  //     sharp(data)
  //     .toFile('hi.png', (err :Error, info : sharp.OutputInfo)=>{
  //       console.log(info);
        
  //       console.log(err);
  //     });
  //   })
  // })
  // // req.pipe(bb);
  // bb.end(req.body);
  // // console.log(req.body);
  // // res.status(200).json({ name: 'John Doe' })
}
