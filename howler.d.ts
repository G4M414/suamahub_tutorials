// howler no trae tipos propios y no queremos sumar @types/howler.
// Solo usamos Howler.stop() para cortar audio remanente del preview.
declare module 'howler' {
  export const Howler: { stop: () => void; unload: () => void };
}
