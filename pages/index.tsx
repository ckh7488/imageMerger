import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import React, { BaseSyntheticEvent, useState } from 'react'
import styles from '../styles/Home.module.css'
import ImageLoader from '../components/ImageLoader'

type dataObject = {
  [num: number]: {
    AttrName: string,
    values: Array<string>,
    fileArr: Array<any>
  }
  description? : string,
  external_url? : string
}


const MyImg: Function = (mySrc: Uint8Array) => {
  return URL.createObjectURL(
    new Blob([mySrc.buffer], { type: 'image/png' })
  )

}

const Home: NextPage = () => {
  const [attrTabArr, setAttrTabArr] = useState<Array<any>>([0, 1]);
  const [dataObj, setDataObj] = useState<dataObject>({});
  const [descriptionValue, setDescriptionValue] = useState<string>('');
  const [external_urlValue, setExternal_urlValue] = useState<string>('');

  const handleDescChange = (e : BaseSyntheticEvent, handlesetFuncion : any)=>{
    handlesetFuncion(e.target.value);
  }

  const handleSetDataObj = (key: number, obj: Object) => {
    const myObj: { [key: number]: any } = { ...dataObj };
    myObj[key] = obj;
    setDataObj(myObj);
  }

  const handleDel = (keyVal: number) => {
    const newAttrTabArr = attrTabArr.filter(e => e !== keyVal);
    setAttrTabArr(newAttrTabArr);
  }

  const handleSend = () => {
    dataObj.description = descriptionValue; 
    dataObj.external_url = external_urlValue;
    console.log("total numArr : ",Object.keys(dataObj));
    const promiseArr = Object.keys(dataObj).slice(0,-2).map(myKey => {

      const objKey = parseInt(myKey);
      const a : Array<Promise<Uint8Array>> = dataObj[objKey].fileArr.map( file => {
         if(file.arrayBuffer) return (file as File).arrayBuffer().then( ab=> new Uint8Array(ab) ) ;
         return file;
        })
      console.log("a : ", a);
      return Promise.all(a)
        .then((x : Array<Uint8Array>) =>{
          
          dataObj[objKey].fileArr = x;
        })
    })
    console.log("promiseArr : ",promiseArr);

    Promise.all(promiseArr)
    // .then(x=> {dataObj.description = descriptionValue; dataObj.external_url=external_urlValue; return 1;} )
    .then(t => fetch('/api/hello',  { method: "POST", body: JSON.stringify(dataObj) }))
  }

  return (
    <div>
      <div>
        <div><div>description : </div><textarea onChange={(e)=>{handleDescChange(e,setDescriptionValue)}} value={descriptionValue}></textarea></div>
        <div><div>external_link : </div><textarea onChange={(e)=>{handleDescChange(e,setExternal_urlValue)}} value={external_urlValue}></textarea></div>
        <br/><br/><br/><br/>

        <span>Bottom layer Img</span>
        <ImageLoader myKey={0} handleSetDataObj={handleSetDataObj}></ImageLoader>
      </div>
      <br /><br /><br/>
      <button onClick={() => { setAttrTabArr([...attrTabArr, attrTabArr.slice(-1)[0] + 1]) }}>addTabs</button>
      <br/>
      {
        attrTabArr.slice(1).map(e => {
          return (
            <div key={e}>
              <span>attr Img</span>
              <ImageLoader handleDel={handleDel} myKey={e} handleSetDataObj={handleSetDataObj}></ImageLoader>
            </div>
          )
        })
      }

      <br/><br/>
      <button onClick={handleSend}>send</button>
      <button onClick={() => { console.log(dataObj) }}>log dataObj</button>
      {/* <button onClick={() => { console.log(attrTabArr)}}>tabs</button> */}
    </div>
  )
}

export default Home
