import { SnakeHuh } from "./ui/icon";

export default function ({ error, isNotFound }: { error?: string, isNotFound?: boolean }) {
    return <div className="w-screen h-screen flex bg-white">
        <div className="m-auto flex rounded-2xl h-2/3 w-2/3 bg-gray-700">
            <div className="m-auto flex flex-col items-center">
                <SnakeHuh alt="Snake" className='size-40' />
                <p className='text-white text-2xl mt-5 font-bold'>{isNotFound ? "Page not found..." : error ? error : "Error occured..."}</p>
            </div>
        </div>
    </div>;
}
