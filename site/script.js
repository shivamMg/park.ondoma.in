const TxtRecordHost = "_parking-on-domain";
const AttributeMarkup = "m";
const AttributeStyle = "s";
const BodyContainerHtmlId = "body_container";

const MarkupHtml = {
	bio: `
<div id="markup_container">
	<div id="title"></div>
	<div id="description"></div>
	<div id="art"></div>
	<div id="links">
		<ul>
			<li id="github_link"></li>
		</ul>
	</div>
</div>`,
}
const MarkupHtmlIds = {
	bio: {
		t: "title",
		d: "description",
		g: "github_link",
	}
}

const getTxtRecordGoogle = (name) => {
	// https://developers.google.com/speed/public-dns/docs/doh/json
	const fullName = `${TxtRecordHost}.${name}`;
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
				throw new Error(`TXT record not found at ${fullName}`);
			}
			console.log('txt record:', data.Answer[0].data);
			return data.Answer[0].data;
		});
}

const getTxtRecordCloudflare = (name) => {
	// TODO: implement
	// https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/make-api-requests/dns-json/
}

const parseTxtRecord = (data) => {
	// example data: m=markup;s=style;t=John Doe;d=Software Engineer Aspiring Writer;g=ghost
	const result = {};
	data.split(';').forEach(pair => {
		const [attribute, value] = pair.split('=');
		result[attribute] = value;
	});
	console.log('parsed txt record:', result);
	return result;
}

const setStylesheet = (style) => {
	const githubUserNameIndex = style.indexOf('/');
	if (githubUserNameIndex === -1) {
		throw new Error(`Invalid value of style attribute '${AttributeStyle}': ${attributeValues[AttributeStyle]}. It must be of the form: <UserName>/<Repo>/path/to/dir`);
	}
	const githubUserName = style.substring(0, githubUserNameIndex);
	const githubRepoAndPath = style.substring(githubUserNameIndex);
	const stylesheetUrl = `https://${githubUserName}.github.io/${githubRepoAndPath}/style.css`
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.type = 'text/css';
	link.href = stylesheetUrl;
	document.head.appendChild(link);
}

const setMarkupHtml = (attributeValues) => {
	const markup = attributeValues[AttributeMarkup];
	const markupHtml = MarkupHtml[markup];
	if (markupHtml === undefined) {
		throw new Error(`Invalid value of markup attribute '${AttributeMarkup}': ${markup}. Valid values: ${Object.keys(MarkupHtml)}`);
	}
	document.getElementById(BodyContainerHtmlId).innerHTML = markupHtml;

	Object.entries(MarkupHtmlIds[markup]).forEach(([attribute, htmlId]) => {
		if (attributeValues.hasOwnProperty(attribute)) {
			const elem = document.getElementById(htmlId)
			if (elem) {
				elem.textContent = attributeValues[attribute];
			}
		}
	});
}

const main = () => {
	// const hostname = window.location.hostname;
	const hostname = "tmp.shivammamgain.com";
	getTxtRecordGoogle(hostname)
		.then((txtRecord) => parseTxtRecord(txtRecord))
		.then((attributeValues) => {
			setStylesheet(attributeValues[AttributeStyle]);
			setMarkupHtml(attributeValues);
		});
}

main();
