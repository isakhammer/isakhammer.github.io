"""Download official data; optionally start or follow an email-based LAZ export.

Examples:
  python scripts/download.py
  python scripts/download.py --lidar-email ADDRESS
  python scripts/download.py --poll-lidar

An existing local job ID is reused to avoid submitting duplicate export jobs.
The email is sent only to Kartverket, and is not saved by this script.
"""
from pathlib import Path
import argparse
import json
from urllib.parse import urlparse
import zipfile
import requests
from pyproj import Transformer

ROOT = Path(__file__).resolve().parents[1]
DATA, META = ROOT / "data", ROOT / "metadata"
URL = "https://nedlasting.geonorge.no/hoydedata/DTM1/33-135-175.tif"
REST = "https://hoydedata.no/laserservices/rest/"

def download(url, destination):
    part = destination.with_suffix(destination.suffix+".part")
    with requests.get(url,stream=True,timeout=(20,90)) as r:
        r.raise_for_status()
        with part.open("wb") as f:
            for chunk in r.iter_content(1024*1024):
                f.write(chunk)
    part.replace(destination)
    print(f"Downloaded {destination.name}: {destination.stat().st_size} bytes")

def api(name, payload):
    r=requests.get(REST+name+".ashx", params={"request":json.dumps(payload)},timeout=90)
    r.raise_for_status()
    result=r.json()
    if result.get("Success") is False or result.get("ErrorMessage"):
        raise RuntimeError(result)
    return result

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--lidar-email",help="Start LAZ export; Kartverket sends status messages to this address")
    parser.add_argument("--poll-lidar",action="store_true",help="Check existing LAZ job once and download if ready")
    args=parser.parse_args()
    DATA.mkdir(exist_ok=True); META.mkdir(exist_ok=True)
    if not (DATA/"33-135-175.tif").exists():
        download(URL,DATA/"33-135-175.tif")
    if not (args.lidar_email or args.poll_lidar):
        return
    jobpath=META/"lidar_export_response.json"
    if not jobpath.exists():
        if not args.lidar_email:
            raise RuntimeError("No local job ID. Start one using --lidar-email.")
        x,y=Transformer.from_crs(4326,25833,always_xy=True).transform(13.3967616,68.0902051)
        x,y=round(x),round(y)
        ring=[[x-500,y-500],[x+500,y-500],[x+500,y+500],[x-500,y+500],[x-500,y-500]]
        result=api("startExport",{"CopyEmail":args.lidar_email,"Name":"Sordalen Flakstad laser 2017 1km",
                 "CoordInput":{"type":"Polygon","coordinates":[ring]},"InputWkid":25833,
                 "Format":1,"OutputWkid":25833,"Projects":"NDH Lofoten 2pkt 2017",
                 "ProjectProduct":1,"NHM":0,"ProjectMerge":1,"ClipToPolygon":1,"NonOverlappingProjects":0})
        jobpath.write_text(json.dumps(result,indent=2))
    job=json.loads(jobpath.read_text())
    status=api("exportStatus",{"JobID":job["JobID"]})
    (META/"lidar_export_status.json").write_text(json.dumps(status,indent=2))
    print(json.dumps(status,indent=2))
    if not status.get("Finished") or not status.get("Url"):
        print("LAZ NOT DOWNLOADED: export is not ready. Run --poll-lidar later.")
        return
    url=status["Url"]
    # Export links must come from the official API and remain on its public domains.
    host=urlparse(url).hostname or ""
    if not (host.endswith(".hoydedata.no") or host=="hoydedata.no" or
            host.endswith(".geonorge.no") or host.endswith(".statkart.no")):
        raise RuntimeError(f"Unexpected download host: {host}")
    name=Path(urlparse(url).path).name
    if not name or Path(name).suffix.lower() not in (".zip",".laz"):
        name="sordalen_lidar_export.zip"
    destination=DATA/name
    if not destination.exists():
        download(url,destination)
    if zipfile.is_zipfile(destination):
        with zipfile.ZipFile(destination) as archive:
            for item in archive.infolist():
                relative=Path(item.filename)
                if relative.is_absolute() or ".." in relative.parts:
                    raise RuntimeError("Unsafe archive member")
                archive.extract(item,DATA/"lidar")
            print("Archive members:",archive.namelist())

if __name__=="__main__":
    main()
