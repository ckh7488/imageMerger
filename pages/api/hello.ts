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

}
