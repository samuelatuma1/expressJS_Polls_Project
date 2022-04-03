/**
 * @param {Array} data :-> An array of objects. must have key date 
 * @returns {Array} of data sorted by date from latest to earliest
 */
function sort_by_date(data){
    if(data.length <= 0){
        return data
    }
    let pivot = data.pop()
    let left_arr = []
    let right_arr = []

    for(let datum of data){
        if(datum.date > pivot.date){
            right_arr.push(datum)
        }
        else{
            left_arr.push(datum)
        }
    }

    return sort_by_date(right_arr).concat([pivot]).concat(sort_by_date(left_arr))
}

module.exports = {sort_by_date}
