import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import React, { BaseSyntheticEvent, createElement, ReactComponentElement, SyntheticEvent, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'
import sharp from 'sharp'



const MyImg : Function = (mySrc : Uint8Array) => {
  return URL.createObjectURL(
    new Blob([mySrc.buffer], {type:'image/png'})
  )

}

const Home: NextPage = () => {
  const [fileArr, setFileArr] = useState<Array<File>>([]);
  const [backgroundImg, setBackgroundImg] = useState<any>(null);
  const [imgUrlArr, setImgUrlArr] = useState<Array<string>>([]);


  const handleBackInputChange = async (e : BaseSyntheticEvent) =>{
    // const myFile1 : File = e.target.files[0]
    const tmpArr : Array<File> = [];
    Object.keys(e.target.files).forEach(key=>{tmpArr.push(e.target.files[key])});
   
    setBackgroundImg(tmpArr);
  }
  
  const handleInputChange = async (e : BaseSyntheticEvent)=>{

    //test code start
    const myFile1 : File = e.target.files[0];
    myFile1.arrayBuffer().then(r=>r.slice(0,10)).then(console.log);
    // myFile1.text().then( (r)=>{ console.log(r.slice(1)); })
    
    //test code end


    const tmpArr : Array<File> = [];
    Object.keys(e.target.files).forEach(key=>{tmpArr.push(e.target.files[key])});
    // console.log(tmpArr);
    
    setFileArr(tmpArr);
  }

  const handleSend = async ()=>{
    // const myForm : FormData = new FormData();
    // fileArr.forEach((e,idx)=>{
    //   myForm.append(`file${idx}`,e);
    // })
    const a = fileArr.map(myFile=> myFile.arrayBuffer().then( ab=> new Uint8Array(ab) ));
    // const bodyObj = {bg : await backgroundImg[0].arrayBuffer().then(ab=> new Uint8Array(ab)) , comp : a};
    Promise.all(a)
    .then(async x => { 
      const tmpObj : { [key: string] : any } = {comp : {}}; 
      x.forEach((e,idx)=> {const i = idx.toString(); 
        tmpObj.comp[i]=e}); 
        tmpObj.bg = await backgroundImg[0].arrayBuffer().then((ab : any)=>new Uint8Array(ab));
        return tmpObj 
      })
    .then(r => { console.log(r); fetch('/api/hello', {method:"POST", body: JSON.stringify(r)})})
    
    // fetch('/api/hello',{method: "POST", body : JSON.stringify({myfile:fileArr}) })
    // .then((myres : Response)=> myres.body?.getReader().read())
    // .then(console.log)
  }

  return (
    <div>
      <span>background Img</span>
      <input
        type="file"
        onChange={handleBackInputChange}
      />
      <span>other Img</span>
      <input
        type="file" multiple
        onChange={handleInputChange}
      />
      <button onClick={handleSend}>send</button>
      <div>
        {imgUrlArr.map(e=>
            <img src={e}></img>
          )}
      </div>
    </div>
  )
}

export default Home
