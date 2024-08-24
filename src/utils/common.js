async function getCondition(value,name){
    if(name==="facebook"){
      switch (value) {
        case 'used_good':
             return 'used_good';
        case 'new':
            return 'new';
        case 'used_like_new':
            return 'used_like_new';
        case 'salvage':
            return 'used_like_new';
        case 'used_fair':
            return 'used_fair'
        default:
          break;
      }
    }else if(name==="craiglist"){
      switch (value) {
        case 'used_good':
             return 40;
        case 'new':
            return 10;
        case 'used_like_new':
            return 20;
        case 'salvage':
            return 60;
        case 'used_fair':
            return 50
        default:
          break;
      }
    }

  }

module.exports = {
    getCondition
}
