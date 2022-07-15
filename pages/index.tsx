import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import React, { BaseSyntheticEvent, createElement, ReactComponentElement, SyntheticEvent, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'
import ImageLoader from '../components/ImageLoader'

type dataObject = {
  [num: number]: {
    AttrName: string,
    values: Array<string>,
    fileArr: Array<any>
  }
}


const MyImg: Function = (mySrc: Uint8Array) => {
  return URL.createObjectURL(
    new Blob([mySrc.buffer], { type: 'image/png' })
  )

}

const Home: NextPage = () => {
  const [attrTabArr, setAttrTabArr] = useState<Array<any>>([0, 1]);
  const [dataObj, setDataObj] = useState<dataObject>({});

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

    const promiseArr = Object.keys(dataObj).map(myKey => {

      const objKey = parseInt(myKey);
      const a : Array<Promise<Uint8Array>> = dataObj[objKey].fileArr.map( file => {
         if(file.arrayBuffer) return (file as File).arrayBuffer().then( ab=> new Uint8Array(ab) ) ;
         return file;
        })

      return Promise.all(a)
        .then((x : Array<Uint8Array>) =>{
          
          dataObj[objKey].fileArr = x;
        })
    })
    Promise.all(promiseArr)
    .then(t => fetch('/api/hello',  { method: "POST", body: JSON.stringify(dataObj) }))
  }

  return (
    <div>
      <div>
        <span>background Img</span>
        <ImageLoader key={0} handleDel={handleDel} myKey={0} handleSetDataObj={handleSetDataObj}></ImageLoader>
      </div>
      <br /><br />
      <button onClick={() => { setAttrTabArr([...attrTabArr, attrTabArr.slice(-1)[0] + 1]) }}>addTabs</button>
      <br /><br />

      {
        attrTabArr.slice(1).map(e => {
          return (
            <>
              <span>attr Img</span>
              <ImageLoader key={e} handleDel={handleDel} myKey={e} handleSetDataObj={handleSetDataObj}></ImageLoader>
            </>
          )
        })
      }

      <button onClick={handleSend}>send</button>
      <button onClick={() => { console.log(dataObj) }}>log dataObj</button>
      <button onClick={() => { console.log(attrTabArr)}}>tabs</button>
    </div>
  )
}

export default Home
