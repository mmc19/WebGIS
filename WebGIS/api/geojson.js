export const getData = function () {
    if (localStorage.getItem('geojson')) {
        console.log('geojson存在');
        return JSON.parse(localStorage.getItem('geojson'));

    } else {
        console.log("geojson不存在");
        window.localStorage.setItem('geojson', '[]')
    }
}
export const saveData = function (data) {
    localStorage.setItem('geojson', JSON.stringify(data))
    console.log('geojson已保存');
}
export const deleteData = function (data) {
    localStorage.removeItem('geojson', JSON.stringify(data))
    console.log('点已删除');
}

