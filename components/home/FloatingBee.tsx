'use client'

import Image from 'next/image'

export function FloatingBee() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-[9vw] top-1/2 z-40 hidden -translate-y-1/2 select-none xl:block"
    >
      <div className="animate-[bee-float_4.5s_ease-in-out_infinite]">
        <Image
          src="/bee-mascot.png"
          alt=""
          width={300}
          height={300}
          className="w-[11vw] max-w-[200px] min-w-[140px]"
          priority={false}
          unoptimized
        />
      </div>
    </div>
  )
}
