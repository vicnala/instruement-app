import { Instrument } from "@/lib/definitions";
import Image from "next/image";


export default function InstrumentView({ instrument }: { instrument: Instrument }): JSX.Element {
    return (
      <div className="grid grid-cols-3 gap-6 bg-it-50 border border-it-100 shadow-sm rounded-[15px] overflow-hidden">
        <div className="col-span-1">
          <Image
            src={instrument.cover_image.file_url}
            alt={instrument.cover_image.description || 'Instrument cover image'}
            width={300}
            height={300}
            className="object-cover"
          />
        </div>
        <div className="col-span-2 py-4">
          <h2 className="text-xl text-3xl font-semibold">
            {instrument.title}
          </h2>
          <p className="text-gray-600">
            {instrument.type_name}
          </p>
        </div>
      </div>
    );
  }