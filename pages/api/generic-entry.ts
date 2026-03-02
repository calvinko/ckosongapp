import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/dbConnect';
import GenericEntry from '../../models/GenericEntry';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!(req.method ?? "" in ["GET", "POST", "PUT", "DELETE"])) {
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).end();
  }

  await dbConnect();
  const { method, body, query } = req;
  const { id, indexName, pk, pType, sk, sType, payload } = body;

  try {

    switch (method) {
      case "GET":
        let { id: idGET, indexName: indexNameGET, pk: pkGET, pType: pTypeGET, sk: skGET, sType: sTypeGET } = query;

        if (!indexNameGET && !idGET) {
          return res.status(400).json({ success: false, message: "Provide indexName or id." });
        }

        if (idGET) {
          const entry = await GenericEntry.findById(idGET);
          return res.status(200).json({ success: true, data: parseEntry(entry) });
        }

        // index name is available, let's load either with pk or sk or both
        if (pkGET && pTypeGET && skGET && sTypeGET) {
          const entries = await GenericEntry.find({ indexName: indexNameGET, pk: pkGET, pType: pTypeGET, sk: skGET, sType: sTypeGET }).exec();
          return res.status(200).json({ success: true, data: entries.map(e => parseEntry(e)) });
        }
        else if (pkGET && pTypeGET) {
          const entries = await GenericEntry.find({ indexName: indexNameGET, pk: pkGET, pType: pTypeGET }).exec();
          return res.status(200).json({ success: true, data: entries.map(e => parseEntry(e)) });
        }
        else if (skGET && sTypeGET) {
          const entries = await GenericEntry.find({ indexName: indexNameGET, sk: skGET, sType: sTypeGET }).exec();
          return res.status(200).json({ success: true, data: entries.map(e => parseEntry(e)) });
        }
        else if (indexNameGET) {
          const entries = await GenericEntry.find({ indexName: indexNameGET }).exec();
          return res.status(200).json({ success: true, data: entries.map(e => parseEntry(e)) });
        }
        return res.status(400).json({ success: false, message: "Provide pk and pType or sk and sType OR indexName." });

      case "POST":
        if (!indexName || !pk || !pType || !sk || !sType || !payload) {
          return res.status(400).json({ success: false, message: "Provide indexName, pk, pType, sk, sType, payload." });
        }

        const newEntry = new GenericEntry({ indexName: indexName, pk: pk, pType: pType, sk, sType: sType, payload: JSON.stringify(payload) });
        await newEntry.save();
        return res.status(200).json({ success: true, data: parseEntry(newEntry) });
      case "PUT":

        if (!id || !payload) {
          return res.status(400).json({ success: false, message: "Provide id and payload." });
        }
        const entryToUpdate = await GenericEntry.findByIdAndUpdate(id, { payload: JSON.stringify(payload) });
        return res.status(200).json({ success: true, data: parseEntry(entryToUpdate) });

      case "DELETE":
        if (!id) {
          return res.status(400).json({ success: false, message: "Provide id." });
        }
        await GenericEntry.findByIdAndDelete(id);
        return res.status(200).json({ success: true })
      default:
        break;
    }

    return res.status(400).json({ success: false, message: "Invalid request" });
  } catch (e) {
    console.error("Internal Error for generic-entry. message=" + e.message);
    return res.status(500).json({ success: false, message: e.message });
  }
};

const parseEntry = (entry) => {
  if (!entry) {
    return null;
  }

  return { ...entry._doc, payload: entry?.payload ? JSON.parse(entry.payload) : {} };
}

export default handler;