import fileMetaExtractorUtil, { FileMetaExtractorUtilReturnType } from "./file.meta.extractor.util"

describe('Test FileMetaExtractorUtil', () => {
    const expectResult: FileMetaExtractorUtilReturnType = {
        fieldname: 'files',
        filename: 'test2.txt',
        contentType: 'text/plain'
    }

    const mockSingleChunk = `----------------------------115356555574749442088327
Content-Disposition: form-data; name="files"; filename="test2.txt"
Content-Type: text/plain

yee2
----------------------------115356555574749442088327--`

    it('Should parse filename, content-type', () => {
        const result = fileMetaExtractorUtil(mockSingleChunk)
        expect(result).toEqual(expectResult)
    })

    it('Should be undefined when cannot parsed a chunk', () => {
        const result = fileMetaExtractorUtil('-------')
        expect(result).toBeUndefined()
    })
})