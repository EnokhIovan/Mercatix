export default function AuthLoading({action}) {
  return (
    <>
      <title>Loading</title>
      <div className="
        fixed inset-0 z-[9999]
        flex items-center justify-center
        bg-[var(--background)]
        text-[var(--text-primary)]
      ">
        <div className="flex flex-col items-center">

          {/* Brand */}
          <h1 className="
            mb-8 text-3xl font-extrabold
            tracking-tight text-[var(--primary)]
          ">
            Mercatix<span className="text-[var(--primary-dark)]">.</span>
          </h1>

          {/* Loading Spinner */}
          <div className="
            relative mb-6 flex h-12 w-12
            items-center justify-center
          ">
            <div className="
              absolute h-full w-full
              animate-spin rounded-full
              border-[3px] border-[var(--lavender-soft)]
              border-t-[var(--primary)]
            " />

            <div className="
              h-2 w-2 rounded-full
              bg-[var(--primary-light)]
            " />
          </div>

          {/* Loading Information */}
          <div className="text-center">
            <p className="
              text-sm font-bold
              text-[var(--text-primary)]
            ">
              {action ? action : "Sedang memuat"}
            </p>

            <p className="
              mt-1.5 text-xs
              text-[var(--text-muted)]
            ">
              Mohon tunggu sebentar...
            </p>
          </div>

        </div>
      </div>
      </>
  );
}
