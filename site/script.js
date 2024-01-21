const TXTRecordHost = "_parking-on-domain";
const AttributeNames = {
  m: "markup",
  s: "style",
  t: "title",
  d: "description",
  g: "github-link",
}

getTXTRecordGoogle = (name) => {
	// https://developers.google.com/speed/public-dns/docs/doh/json
  const fullName = `${TXTRecordHost}.${name}`;
	const url = `https://dns.google/resolve?name=${fullName}&type=TXT`;
	return fetch(url)
		.then((response) => {
			if (!response.ok) {
			  throw new Error(`Call to google dns failed: ${response.status} ${response.json()}`);
			}
      return response.json();
    })
    .then((data) => {
      if (data.Answer.length === 0) {
			  throw new Error(`TXT record ${TXTRecordHost} not found`);
      }
      console.log(data.Answer)
      return data.Answer[0].data;
		})
}

getTXTRecordCloudflare = (name) => {
  // TODO: implement
  // https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/make-api-requests/dns-json/
}

parseTXTRecord = (data) => {
  // m=markup;s=style;t=John Doe;d=Software Engineer Aspiring Writer;g=ghost
  console.log(data)
  const result = {};
  data.split(';').forEach(pair => {
    const [attribute, value] = pair.split('=');
    result[attribute] = value;
  });
  return result;
}

main = () => {
  // const hostname = window.location.hostname;
  const hostname = "shivammamgain.com";
  getTXTRecordGoogle(hostname)
    .then((txtRecord) => parseTXTRecord(txtRecord))
    .then((attributeValues) => {
      console.log(attributeValues)
      Object.entries(attributeValues).forEach(([attribute, value]) => {
        if (AttributeNames.hasOwnProperty(attribute)) {
          const elem = document.getElementById(AttributeNames[attribute])
          if (elem) {
            elem.textContent = value;
          }
        }
      });
    })
}

main()
