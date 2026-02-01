"use client"

import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';

interface PhotoCompareSliderProps {
    beforeImage: string;
    afterImage: string;
    beforeLabel?: string;
    afterLabel?: string;
}

export default function PhotoCompareSlider({
    beforeImage,
    afterImage,
    beforeLabel = "入会時",
    afterLabel = "現在"
}: PhotoCompareSliderProps) {
    return (
        <div className="relative w-full rounded-lg overflow-hidden">
            <ReactCompareSlider
                itemOne={
                    <ReactCompareSliderImage
                        src={beforeImage}
                        alt={beforeLabel}
                        style={{ objectFit: 'cover' }}
                    />
                }
                itemTwo={
                    <ReactCompareSliderImage
                        src={afterImage}
                        alt={afterLabel}
                        style={{ objectFit: 'cover' }}
                    />
                }
                style={{ height: '400px' }}
                position={50}
            />
            <div className="absolute bottom-4 left-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                {beforeLabel}
            </div>
            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                {afterLabel}
            </div>
        </div>
    );
}
