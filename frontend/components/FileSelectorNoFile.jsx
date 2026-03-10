import { ArrowUpSquare } from 'lucide-react'
import React from 'react'

const FileSelectorNoFile = () => {
    return (
        <div className="flex flex-col justify-center items-center gap-5">
            <ArrowUpSquare strokeWidth={1} size={36} className='text-secondary' />

            <div className="flex flex-col justify-center items-center gap-1">
                <p className="text-center text-sm text-secondary font-light leading-relaxed tracking-wide">
                    <span className="font-medium text-primary">Click to upload </span>
                    or drag and drop
                </p>

                <p className="text-xs text-secondary">PDF · DOCX</p>
            </div>
        </div>
    )
}

export default FileSelectorNoFile