import React,{useEffect,useRef} from 'react';
export default function Modal({title,close,children}){const ref=useRef();useEffect(()=>{ref.current.showModal()},[]);return <dialog ref={ref} onCancel={e=>{e.preventDefault();close()}}><button className="close" onClick={close} aria-label="Sluiten">✕</button><h2>{title}</h2>{children}</dialog>}
