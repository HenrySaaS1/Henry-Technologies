const safetyImageModules = import.meta.glob(
  [
    '../../assets/uploads/harland/*/*-safety/*.png',
    '../../assets/uploads/harland/*/*-safety/*.jpg',
    '../../assets/uploads/harland/*/*-safety/*.jpeg',
    '../../assets/uploads/harland/*/*-safety/*.webp',
  ],
  {
    eager: true,
    import: 'default',
  },
)

function safetyImageNumber(path) {
  const filename = path.split('/').pop() || ''

  const match = filename.match(/-safety-(\d+)\./i)

  return match
    ? Number(match[1])
    : Number.MAX_SAFE_INTEGER
}

function imagesForBusinessUnit(folderName) {
  const normalizedFolderName =
    String(folderName).toLowerCase()

  const expectedFolderPath =
    `/harland/${normalizedFolderName}/${normalizedFolderName}-safety/`

  return Object.entries(safetyImageModules)
    .filter(([path]) =>
      path
        .toLowerCase()
        .includes(expectedFolderPath),
    )
    .sort(([pathA], [pathB]) => {
      const numberDifference =
        safetyImageNumber(pathA) -
        safetyImageNumber(pathB)

      if (numberDifference !== 0) {
        return numberDifference
      }

      return pathA.localeCompare(pathB)
    })
    .map(([, imageSource]) => imageSource)
}

export const HARLAND_SAFETY_IMAGES = {
  '120': imagesForBusinessUnit('bu120'),
  '125': imagesForBusinessUnit('bu125'),
  '140': imagesForBusinessUnit('bu140'),
  '150': imagesForBusinessUnit('bu150'),
  '180': imagesForBusinessUnit('bu180'),
  '190': imagesForBusinessUnit('bu190'),
  '220': imagesForBusinessUnit('bu220'),
  warehouse: imagesForBusinessUnit('warehouse'),
}