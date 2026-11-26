import { useEffect, useRef } from 'react'

interface PhotoPreviewProps {
  file: File
  className?: string
}

/**
 * 고른 사진의 미리보기 — `URL.createObjectURL`은 문서가 살아 있는 동안 파일을 메모리에 붙잡는다.
 * 만든 effect의 클린업이 지운다: 사진을 바꾸거나(file 변경) 빼거나 모달이 닫히면(언마운트) 이전 URL이 해제된다 (WORKPLAN D8).
 *
 * URL을 state에 담지 않고 effect가 `<img>`의 src를 직접 넣는다 — state에 담으려면 effect 안에서 setState를 불러
 * 렌더가 한 번 더 돈다(react-hooks/set-state-in-effect). useMemo로 만들면 StrictMode가 계산을 두 번 돌려 하나가 새고,
 * 클린업이 지운 URL을 다시 만들지 않아 미리보기가 깨진다. effect는 StrictMode의 이중 실행에서도 지우고 다시 만든다
 */
const PhotoPreview = ({ file, className }: PhotoPreviewProps) => {
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = imgRef.current
    if (!img) return
    const url = URL.createObjectURL(file)
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  return <img ref={imgRef} className={className} alt="고른 사진 미리보기" />
}

export default PhotoPreview
