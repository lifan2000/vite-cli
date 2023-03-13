import { resolveModule as _resolveModule } from "@lf/utils";
export const resolveModule = (path) => {
    return _resolveModule(path,import.meta.url)
}