import Yolo from '../yolo';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'YOLO.BA — Discover Buenos Aires',alternates:{canonical:'/en',languages:{'es-AR':'/','en':'/en'}}};
export default function Page(){return <Yolo english/>}
