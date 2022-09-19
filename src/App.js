import { Suspense, useRef, useEffect, useState } from 'react';
import 'materialize-css';
import { Button } from "react-materialize";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, TransformControls } from "@react-three/drei";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Model = () => {
  const gltf = useLoader(GLTFLoader, "./assets/low_poly_building/scene.gltf");
  return (
    <primitive object={gltf.scene} position={[2, 0, -2]} scale={1} />
  );
};

function App() {
  const orbit = useRef()
  const transform = useRef();
  const fmesh = useRef();
  const mesh = useRef();
  const [currentBox, setCurrentBox] = useState(null);
  const [isBtnSelected, setBtnSelected] = useState(false);
  const [positions, setpositions] = useState([]);
  const [showDetail, setDetail] = useState(null);
  const [isSaved, setSave] = useState(false);
  const [selectedBoxIdx, selectBoxIdx] = useState(null);

  useEffect(() => {
    if (transform.current) {
      const controls = transform.current;
      controls.removeEventListener('dragging-changed', callBack);
      controls.removeEventListener('change', changeListener);
      controls.addEventListener('dragging-changed', callBack);
      controls.addEventListener('change', changeListener);
    }
    window.removeEventListener('keydown', keyDownHandler);
    window.addEventListener('keydown', keyDownHandler);
    const transformRef = transform.current;
    return () => {
      if (transformRef) transformRef.removeEventListener('dragging-changed', callBack);
      if (transformRef) transformRef.removeEventListener('change', changeListener);
      window.removeEventListener('keydown', keyDownHandler);
    }
  }, [isBtnSelected, keyDownHandler]);

  function callBack(event) {
    orbit.current.enabled = !event.value;
  }

  function changeListener(ev) {
    const position = {
      x: ev.target.object.position.x,
      y: ev.target.object.position.y,
      z: ev.target.object.position.z,
    };
    setCurrentBox(position);
  }

  function deleteBox() {
    if (selectedBoxIdx !== null) {
      const modPos = positions.slice();
      modPos.splice(selectedBoxIdx, 1);
      setpositions(modPos);
      selectBoxIdx(null);
    }
  }

  useEffect(() => {
    if (isSaved) {
      setpositions([
        ...positions,
        currentBox
      ]);
      setBtnSelected(false);
    }
  }, [isSaved, positions, currentBox])

  function createButton() {
    setBtnSelected(true);
    setSave(false);
  }

  function keyDownHandler(e) {
    if (isBtnSelected && e.code === 'KeyS') {
      setSave(true);
    }
  }

  function detailHandler(pos, i) {
    console.log(pos);
    setDetail(
      {
        x: pos.x.toFixed(2),
        y: pos.y.toFixed(2),
        z: pos.z.toFixed(2),
      }
    )

    selectBoxIdx(i);
  }

  return (
    <div className="App">
      <Canvas>
        <Suspense fallback={<mesh ref={fmesh}>
          <boxGeometry />
          <meshPhongMaterial />
        </mesh>}>
          <Model />
        </Suspense>
        <ambientLight intensity={1} />
        <OrbitControls ref={orbit} />
        <PerspectiveCamera makeDefault position={[12, 12, 12]} />
        {isBtnSelected && <TransformControls ref={transform}>
          <mesh ref={mesh} scale={0.1}>
            <boxGeometry args={[4, 4, 4]} />
            <meshStandardMaterial color={'hotpink'} />
          </mesh>
        </TransformControls>}
        {positions && positions.length > 0 && positions.map((pos, i) => {
          return (
            <mesh key={i} ref={mesh} onClick={() => detailHandler(pos, i)} position={[pos.x, pos.y, pos.z]} scale={0.1}>
              <boxGeometry args={[4, 4, 4]} />
              <meshStandardMaterial color={'hotpink'} />
            </mesh>
          )
        })}
      </Canvas>
      <Button
        node="button"
        tooltip="Click to create a BOX and then drag it to the desired location."
        waves="light"
        className="create-button"
        onClick={createButton}
      >
        Create BOX
      </Button>
      <div className="card how-to blue-grey darken-1">
        <div className="card-content white-text">
          <h4 className="card-title">How To Use?</h4>
          <ul>
            <li>
              <p>Hold the left mouse button and drag the mouse to rotate the model.</p>
            </li>
            <li>
              <p>Click the CREATE BOX to create a BOX and then drag it to the desired location using the translation transform controls</p>
            </li>
            <li>
              <p>After you have placed the BOX to your desired location then press the key 'S'.</p>
            </li>
            <li>
              <p>You can click on the BOX to get the location details of it & also you can delete it by clicking on Delete BOX action.</p>
            </li>
          </ul>
        </div>
      </div>
      <div className="card details blue-grey darken-1">
        <div className="card-content white-text">
          <h4 className="card-title">BOX Position Details: </h4>
          <p>{showDetail ? `X: ${showDetail.x} Y: ${showDetail.y} Z: ${showDetail.z}` : 'No Button Selected'}</p>
        </div>
        <div className="card-action">
          <Button
            node="button"
            onClick={() => deleteBox()}>
              Delete BOX
          </Button>
      </div>
    </div>
    </div >
  );
}

export default App;
