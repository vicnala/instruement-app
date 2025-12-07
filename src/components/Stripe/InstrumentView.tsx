import { Instrument } from "@/lib/definitions";
import Image from "next/image";


export default function InstrumentView({ instrument }: { instrument: Instrument }): JSX.Element {
    return (
      <div className="grid grid-cols-2 gap-6 bg-scope-50 border border-scope-100 shadow-sm rounded-section overflow-hidden">
        <div className="col-span-1">
          <Image
            src={instrument.cover_image.file_url}
            alt={instrument.cover_image.description || 'Instrument cover image'}
            width={300}
            height={300}
            className="object-cover"
          />
        </div>
        <div className="col-span-1 py-4">
          <h2 className="text-xl font-semibold">
            {instrument.title}
          </h2>
          <p className="text-scope-600">
            {instrument.type_name}
          </p>
        </div>
      </div>
    );
  }