export default {
    methods: {
        _saveArrayOfStringsToFileSystem(arr, fn) {
            const data = JSON.stringify(arr)
            // const blob = new Blob(data, {type: 'text/plain'})
            const e = document.createEvent('MouseEvents')
            const a = document.createElement('a')
            a.download = fn;
            // a.href = window.URL.createObjectURL(blob);
            a.href = window.URL.createObjectURL(data)
            a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
            e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
        },
        _createURLText(data, fn) {
            console.log("_createURLText")
            const properties = {type: 'text/plain'}
            const file = new File(data, fn, properties)
            return URL.createObjectURL(file)
        },
        _downloadTextFile(studentList, downloadFn) {
            const data = []
            for (const student of studentList) {
                const textItem = student.emailAddress + " " + student.sortName + "\r\n"
                data.push(textItem)
            }

            let file;
            const properties = {type: 'text/plain'}; // Specify the file's mime-type.
            try {
                // Specify the filename using the File constructor, but ...
                file = new File(data, "file.txt", properties);
            } catch (e) {
                // ... fall back to the Blob constructor if that isn't supported.
                file = new Blob(data, properties);
            }
            var url = URL.createObjectURL(file);

            const a = document.createElement('a');
            a.href = url
            a.download = downloadFn
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
        }
    }
}