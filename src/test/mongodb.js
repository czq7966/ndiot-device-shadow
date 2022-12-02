import { MongoClient } from 'mongodb';
const url = "mongodb://preproduction_mdb_iot_data:jBZsDUZSnnT0@m3.edu.pre-prod.mongod.sdp:34001/preproduction_mdb_iot_data";
const client = new MongoClient(url);

const dbName = 'preproduction_mdb_iot_data';

async function main() {
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);
  let colls = [
      "CMDGATE_CL_FRF308_",
      "CMDGATE_CL_FRF319_",
      "CMDGATE_CL_XZ_MSG_",
      "CMDGATE_FZ_DEV_",
      "CMDGATE_FZ_DM_AC_",
      "CMDGATE_FZ_YT2DGN_",
      "CMDGATE_FZ_YT_AC_",
      "CMDGATE_XA_KFDX03_",
      "CMDGATE_XA_KFDX08_",
      "null_"
    ]
  
  for (let i = 20211119; i <= 20220613; i++) {  
      for (let j = 0; j < colls.length; j++) {
        let coll = colls[j]
        try {
            let collection = db.collection(coll + i);
            await collection.drop();                    
        } catch (error) { /* empty */ }          
      }        
  }

  return 'done.';
}


main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());