import { useState, BaseSyntheticEvent, useEffect } from "react";


const ImageLoader = (props: any) => {
    // console.log(props)
    const [fileArr, setFileArr] = useState<Array<File>>([]);
    const [inputValues, setInputValues] = useState<Array<string>>([]);
    const [isLock, setIsLock] = useState<boolean>(false);
    let blobUrlArr : Array<any> = [];

    const handleStringChange = (e: BaseSyntheticEvent, num : number) =>{
        // console.log(e.target.value, num);
        inputValues[num] = e.target.value;
        setInputValues([...inputValues]);
    }

    const handleInputChange = async (e: BaseSyntheticEvent) => {
        setInputValues([]);
        if(blobUrlArr.length > 0) {blobUrlArr.forEach(e=> URL.revokeObjectURL(e)); blobUrlArr=[]; };
        const myFile1: File = e.target.files[0];
        myFile1.arrayBuffer().then(r => r.slice(0, 10)).then(console.log);

        const tmpArr: Array<File> = [];
        Object.keys(e.target.files).forEach(key => { tmpArr.push(e.target.files[key]) });

        setFileArr(tmpArr);
    }

    const handleLock = ()=>{
        if(props.handleSetDataObj && !isLock) {
            const myObj : {[key : string]: any} = {AttrName : inputValues[0], values : inputValues.slice(1), fileArr : fileArr};
            // myObj = {AttrName : inputValues[0], values : inputValues.slice(1), fileArr : fileArr};
            props.handleSetDataObj(props.myKey, myObj);
            setIsLock(true);
        }
    }



    return (
        <div style={{ border: 'solid black 1px' }}>
            <div>other Img</div>
            <span>AttrName : </span><input disabled={isLock} onChange={ (e)=>{handleStringChange(e,0)}} value={inputValues[0] ?? ''} />
            <span>
                {
                    fileArr.map((e,idx) => {
                        const iUrl = URL.createObjectURL(e);
                        blobUrlArr.push(iUrl);
                        return (
                            <div style={{}} key={e.name}>
                                <img src={iUrl} style={{ height: '150px' }} ></img>
                                <span>value : </span><input disabled={isLock} onChange={ (e)=>{handleStringChange(e,idx+1)} }></input>
                            </div>
                        )
                    }
                    )
                }
            </span>
            <input
                disabled={isLock} 
                type="file" multiple
                onChange={handleInputChange}
            />
            <button disabled={isLock} onClick={()=>{handleLock() }}>{isLock ? 'Locked' : 'Lock'}</button>
            <button disabled={isLock} onClick={props.handleDel.bind(null, props.myKey)}>delete this tab</button>
            <button onClick={()=>{console.log(props, fileArr, inputValues, isLock)}}>state status</button>
        </div>
    )
}

export default ImageLoader;