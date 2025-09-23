import { Home } from "lucide-react";
import { SnakeHuh } from "./ui/icon";
import { useNavigate } from "react-router";

export default function ({ error, isNotFound }: { error?: string, isNotFound?: boolean }) {
    const navigator = useNavigate();

    return <div className="w-screen h-screen flex bg-white">
        <div className="m-auto flex rounded-2xl xl:h-2/3 xl:w-2/3">
            <div className="m-auto flex flex-col items-center">
                <SnakeHuh alt="Snake" className='size-40' />
                <p className='text-black text-2xl mt-5 font-bold'>{isNotFound ? "Page not found..." : error ? error : "An error occured..."}</p>
                <div
                    className="p-5 mt-5 flex flex-row items-center gap-3 bg-gray-700 text-white rounded-2xl text-xl xl:text-2xl cursor-pointer"
                    onClick={() => navigator("/")}
                >
                    <Home />
                    <p>Go to Home</p>
                </div>
            </div>
        </div>
    </div>;
}
