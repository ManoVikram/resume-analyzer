import { CheckSquare2 } from 'lucide-react'
import React from 'react'

const FileSelectorFileSelected = ({ filename }) => {
    return (
        <div className="w-full flex flex-col justify-center items-center gap-5">
            <CheckSquare2 strokeWidth={1} size={36} className='text-green-600' />

            <div className="max-w-full flex flex-col justify-center items-center gap-3">
                <div className="w-full flex justify-start items-center bg-primary rounded-full px-4.5 py-2.5 gap-2">
                    <div className="h-1.75 w-1.75 aspect-square rounded-full bg-green-500" />

                    <p className="text-white text-sm font-medium truncate">{filename}</p>
                </div>

                <p className="text-xs font-light text-secondary">Click to change</p>
            </div>
        </div>
    )
}

export default FileSelectorFileSelected