import { useThree } from "@react-three/fiber";
import { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

function Chair({ chair}) {
    if (!chair || !chair[0] || !chair[0].id) {
        return null;
    }

    let url = chair[0].id
    useGLTF.preload(url)
    const { scene } = useGLTF(url, true);


    return (
        <>
        <primitive name={url} object={scene} visible={true}  position={[0, -1, 0]} />
        </>
    )
}

export default Chair