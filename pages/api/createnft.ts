// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import sharp from 'sharp';
import type { NextApiRequest, NextApiResponse } from 'next'
import mongoClient from '../../lib/mongodb'

type simpleParsedObj = { [idx: string]: string }
type indexSignaturesOfParedObj = {
  AttrName: string,
  values: Array<string>,
  fileArr: Array<{ [idx: string]: number }>
}


interface reqBodyObject {
  [key: string]: indexSignaturesOfParedObj | simpleParsedObj
  description: simpleParsedObj
  external_url: simpleParsedObj
}

function isIndexSignaturesOfParedObj(arg: any): arg is indexSignaturesOfParedObj {
  return typeof arg.AttrName === 'string';
}



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const myObj: reqBodyObject = JSON.parse(req.body);
  console.log(Object.keys(myObj));
  console.log(Object.values(myObj.description));
  console.log(Object.values(myObj.external_url));

  // console.log(myObj['1']['AttrName'], myObj['1']['values']);


  //save images from req.body
  const backgroundImg = new Uint8Array(Object.values(myObj['0'].fileArr[0]));
  // const compImg = new Uint8Array(Object.values(myObj['1'].fileArr[4]));
  // let dataArr: { imgBuffer: Buffer | Uint8Array, meta: { trait_type: string, value: string }[] }[] = [];
  let dataArr: Array<{ imgBuffer: Uint8Array, meta: Array<{ trait_type: string, value: string }> }> = [];

  if (isIndexSignaturesOfParedObj(myObj['0'])) {
    dataArr = await Promise.all(
      myObj['0'].fileArr.map(async (file, idx) => {
        //metaData part
        const name = myObj['0'].AttrName;
        const val = myObj['0'].values[idx];
        const meta = { trait_type: name, value: val };

        //image part
        const aImg = new Uint8Array(Object.values(file));

        return { imgBuffer: aImg, meta: [meta] };
      })
    )
  }
  else { res.send({ message: 'received data is not right' }); return; }

  // 
  for (let index of Object.keys(myObj).slice(1, -2)) {

    if (isIndexSignaturesOfParedObj(myObj[index])) {
      const indexedObj = myObj[index] as indexSignaturesOfParedObj;
      const indexAttrName = indexedObj.AttrName;
      console.log(indexAttrName);

      const tmpArr = [];
      for (let dataArrIndex in dataArr) {

        for (let myObjIndex in indexedObj.fileArr) {
          // metadata part
          const newMeta = JSON.parse(JSON.stringify(dataArr[dataArrIndex].meta));
          const newMetaObj = { trait_type: indexAttrName, value: indexedObj.values[myObjIndex] };
          newMeta.push(newMetaObj);
          // tmpArr.push({meta : newMeta});
          //img part
          const baseImg = dataArr[dataArrIndex].imgBuffer;
          const img = await
            sharp(baseImg)
              .composite([
                { input: new Uint8Array(Object.values(indexedObj.fileArr[myObjIndex])) }
              ])
              .toBuffer()

          // img ?????? ??????
          // sharp(baseImg)
          //   .composite([
          //     { input: new Uint8Array(Object.values(indexedObj.fileArr[myObjIndex])) }
          //   ])
          //   .toFile(`${dataArrIndex}_${myObjIndex}.png`);
          tmpArr.push({ imgBuffer: img, meta: newMeta });
        }
      }
      dataArr = tmpArr;
    }
    else { res.send({ message: 'received data is not right' }); return; }
  }
  console.log('dataArr metadata is : ', dataArr.map(e => e.meta));
  console.log('dataArr img is : ', dataArr.map(e => e.imgBuffer.length));

  type DataArr = { imgBuffer: Buffer | Uint8Array, meta: { trait_type: string, value: string }[] }[];

  // db structure 

  // dbName : MetaData
  // collectionName : test    // should be username or ...?

  // document structure
  // {
  //   
  //   {
  //     "description": "Friendly OpenSea Creature that enjoys long swims in the ocean.",   // front page should get this field from user. ( optional )
  //     "external_url": "https://openseacreatures.io/3",
  //     "image": "https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png",
  //     "name": "Dave Starbelly",
  //     "attributes": [... ], 
  //   }
  // }
  //  many of document which has this structure wll be placed at db('MetaData').collection(`${userId}`)



  const myClient = await mongoClient;

  const dbImgItem =
    dataArr.map((e, idx) => {
      const imgObj: { [idx: string]: any } = {};
      imgObj['index'] = idx;
      imgObj['img'] = e.imgBuffer
      return imgObj;
    })
  myClient.db('test').collection('img').insertMany(dbImgItem);

  const dbMetaItem =
    dataArr.map((e, idx) => {
      const metaObj: { [idx: string]: any } = {};
      // const imgBuffer: Promise<any> = await myClient.db('test').collection('test').find({ index: idx }).toArray()
      //   .then(
      //     r => {
      //       console.log(Object.keys(r[idx].img));
      //       console.log(r[idx].img?.buffer);     // ????????? ?????? ?????? ??????
      //       sharp(r[idx].img?.buffer)
      //         .toFile(`${idx}.png`);
      //       return r[idx].img?.buffer;
      //     }

      //   );
      metaObj[`meta_${idx}`] =
      {
        description: myObj.description,
        external_url: myObj.external_url,
        image: 'imgURL',
        name : `testName # ${idx}`,
        attributes : e.meta
      }
      return metaObj;
    })
  myClient.db('test').collection('meta').insertMany(dbMetaItem);
  // myClient.db('test').collection('test').insertOne({test:"test"});



  // console.log(dataArr.map(e => e.meta));
  // // forEach(index => {
  //   const a = dataArr.map(async dataObj => {
  //     console.log(dataArr.length);
  //     const z =await p;

  //     let ret: any = [];
  //     const metaDataName = myObj[index].AttrName;


  //     for (let i in myObj[index].fileArr) {
  //       console.log(myObj[index].values[i]);
  //       const myImgArr = [ { input : new Uint8Array(Object.values(myObj[index].fileArr[i])) } ];
  //       const img =
  //           sharp(dataObj.imgBuffer)
  //           .composite(
  //             myImgArr
  //           )
  //           .toBuffer();

  //           sharp(dataObj.imgBuffer)
  //           .composite(
  //             myImgArr
  //           )
  //           .toFile(`${index}_${i}.png`)
  //       // .toFile(`${names}_${values}.png`);

  //       const metaDataVal = myObj[index].values[i];
  //       // console.log(dataObj.meta);
  //       const newMeta = JSON.parse(JSON.stringify(dataObj.meta));
  //       newMeta.push({trait_type : metaDataName, value : metaDataVal});
  //       // console.log(newMeta);
  //       ret.push({ imageBuffer: await img, meta : newMeta });
  //     }

  //     return ret;
  //   })
  //   p = Promise.all(a).then(a=>a[0]).then(r=>{dataArr=r; return r;});
  //   // console.log(dataArr.map(e=>e.meta));
  //   // .then(z=>z.map(x=>x.meta)).then(console.log);
  // // })


  // console.log('last one is : ', dataArr.map(e => e.meta));


  // // console.log(JSON.parse(req.body));
  // const myObjRes  = JSON.parse(req.body);
  // // console.log(Object.keys(myRes));

  // // console.log(Object.keys(myRes['0']));
  // // console.log(typeof myRes['0'])
  // // console.log(myObjRes['bg']);
  // const A : Array<number> = Object.values(myObjRes['bg']);
  // const B = new Uint8Array(A);
  // console.log(B.length, typeof B);

  // const myRes = myObjRes['comp'];
  // const imgArr : any = Object.keys(myRes)
  // // .slice(1)
  // .map((idx) =>{
  //   console.log(idx);
  //   console.log(new Uint8Array(Object.values(myRes[idx])));
  //   return {input : new Uint8Array(Object.values(myRes[idx]))};
  // })
  // console.log(B);
  // console.log(imgArr);

  //   sharp(B)
  //   .toFile('before.png');
  //   sharp(B)
  //   .composite(
  //     imgArr
  //   )
  //   .toFile('a.png',(err,info)=>{
  //     console.log(err,info)
  //   });
  //   // console.log(myRes['0'][i]);



  res.send("hi");

}


export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb' // Set desired value here
    }
  }
}
