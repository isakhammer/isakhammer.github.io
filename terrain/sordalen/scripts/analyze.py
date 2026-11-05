"""Rebuild verified terrain artifacts from the official downloaded DTM1 tile.

Run with the dependencies in ../requirements.txt. No network requests are made.
Profiles are exploratory transects, not a surveyed cliff top/base measurement.
"""
from pathlib import Path
import csv
import hashlib
import json
import os

os.environ.setdefault("MPLCONFIGDIR", "/tmp/sordalen-matplotlib")
import numpy as np
import rasterio
from rasterio.windows import from_bounds
from pyproj import Transformer, CRS
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LightSource, Normalize
import plotly.graph_objects as go

ROOT = Path(__file__).resolve().parents[1]
DATA, OUT, META = (ROOT / x for x in ("data", "outputs", "metadata"))
for p in (DATA, OUT, META):
    p.mkdir(exist_ok=True)
LAT, LON = 68.0902051, 13.3967616
forward = Transformer.from_crs(4326, 25833, always_xy=True)
inverse = Transformer.from_crs(25833, 4326, always_xy=True)
X, Y = forward.transform(LON, LAT)
raw = DATA / "33-135-175.tif"
crop = DATA / "sordalen_dtm1_2km.tif"

if raw.exists():
    with rasterio.open(raw) as src:
        bounds = [np.floor(X)-1000, np.floor(Y)-1000,
                  np.floor(X)+1000, np.floor(Y)+1000]
        win = from_bounds(*bounds, src.transform).round_offsets().round_lengths()
        a = src.read(1, window=win, masked=True)
        profile = src.profile.copy()
        profile.update(driver="GTiff", width=a.shape[1], height=a.shape[0],
                       transform=src.window_transform(win), compress="deflate",
                       tiled=True, blockxsize=256, blockysize=256)
        with rasterio.open(crop, "w", **profile) as dst:
            dst.write(a.filled(src.nodata), 1)
            dst.update_tags(SOURCE="Kartverket DTM1 33-135-175.tif",
                            CREDIT="Kartverket, NLOD 2.0", VERTICAL_CRS="EPSG:5941 / NN2000",
                            TARGET_LAT=LAT, TARGET_LON=LON)

with rasterio.open(crop) as src:
    grid = src.read(1, masked=True)
    transform, bounds = src.transform, src.bounds
    assert src.crs.to_epsg() == 25833
    assert src.res == (1.0, 1.0)
    assert grid.shape == (2000, 2000)
    assert not np.any(np.ma.getmaskarray(grid)), "Incomplete DTM coverage"
    z = np.asarray(grid, dtype=float)
    point_nearest = float(next(src.sample([(X, Y)]))[0])

def sample(xs, ys):
    """Bilinear interpolation on pixel centres, preserving physical coordinates."""
    c = (np.asarray(xs)-transform.c)/transform.a - 0.5
    r = (np.asarray(ys)-transform.f)/transform.e - 0.5
    c0, r0 = np.floor(c).astype(int), np.floor(r).astype(int)
    assert np.all((c0 >= 0) & (c0+1 < z.shape[1]))
    assert np.all((r0 >= 0) & (r0+1 < z.shape[0]))
    dc, dr = c-c0, r-r0
    return ((1-dc)*(1-dr)*z[r0,c0] + dc*(1-dr)*z[r0,c0+1]
            + (1-dc)*dr*z[r0+1,c0] + dc*dr*z[r0+1,c0+1])

point_height = float(sample(X, Y))
dist = np.arange(-500., 501., 1.)
profiles = []
for name, azimuth, label, color in [
    ("south_north", 0., "Sør → nord", "#006e90"),
    ("west_east", 90., "Vest → øst", "#b56816"),
    ("southwest_northeast", 45., "Sørvest → nordøst", "#8463aa"),
]:
    rad = np.deg2rad(azimuth)
    xs, ys = X+dist*np.sin(rad), Y+dist*np.cos(rad)
    zs = sample(xs, ys)
    lons, lats = inverse.transform(xs, ys)
    p = dict(name=name, azimuth=azimuth, label=label, color=color,
             x=xs, y=ys, z=zs, lon=lons, lat=lats)
    profiles.append(p)
    with (OUT/f"profile_{name}.csv").open("w", newline="") as f:
        writer = csv.writer(f, lineterminator="\n")
        writer.writerow(["distance_from_target_m", "easting_epsg25833_m", "northing_epsg25833_m",
                         "longitude_deg", "latitude_deg", "height_nn2000_m"])
        writer.writerows(zip(dist, np.round(xs,3), np.round(ys,3),
                            np.round(lons,9), np.round(lats,9), np.round(zs,3)))

features = [{"type":"Feature", "properties":{"name":"Oppgitt punkt", "height_nn2000_m":point_height},
             "geometry":{"type":"Point", "coordinates":[LON,LAT]}}]
for p in profiles:
    features.append({"type":"Feature", "properties":{"name":p["name"],"azimuth_grid_north_deg":p["azimuth"]},
                     "geometry":{"type":"LineString", "coordinates":np.column_stack([p["lon"],p["lat"]]).tolist()}})
(OUT/"transects.geojson").write_text(json.dumps({"type":"FeatureCollection","features":features},ensure_ascii=False))

plt.rcParams.update({"font.family":"DejaVu Sans", "font.size":11,
                     "axes.spines.top":False, "axes.spines.right":False})
extent = [bounds.left-X,bounds.right-X,bounds.bottom-Y,bounds.top-Y]
norm = Normalize(vmin=0, vmax=610)
rgb = LightSource(azdeg=315,altdeg=45).shade(z, cmap=plt.get_cmap("terrain"),
                                         norm=norm, vert_exag=1, dx=1, dy=1, blend_mode="soft")
fig, ax = plt.subplots(figsize=(10,9),layout="constrained")
ax.imshow(rgb,extent=extent,origin="upper")
cs = ax.contour(np.arange(2000)+bounds.left+0.5-X,
                bounds.top-np.arange(2000)-0.5-Y,z,
                levels=np.arange(0,651,100),colors="#263a30",linewidths=.45,alpha=.65)
ax.clabel(cs,fmt="%d m",fontsize=8)
for p in profiles:
    ax.plot(p["x"]-X,p["y"]-Y,color=p["color"],lw=1.7,label=p["label"])
ax.scatter([0],[0],s=85,c="#b92038",edgecolors="white",zorder=9)
ax.annotate(f"Oppgitt punkt · {point_height:.0f} m",(0,0),xytext=(-450,-190),
            arrowprops={"arrowstyle":"-","color":"#b92038"},color="#8b1024",
            bbox={"facecolor":"white","alpha":.9,"edgecolor":"none","pad":5})
ax.set(xlabel="Øst for punktet (m)",ylabel="Nord for punktet (m)",
       title="Sørdalen, Flakstad · DTM1 og profillinjer\n68.0902051° N, 13.3967616° E")
ax.legend(loc="lower left",framealpha=.95)
fig.colorbar(plt.cm.ScalarMappable(norm=norm,cmap="terrain"),ax=ax,label="Terrenghøyde (m NN2000)",shrink=.75)
fig.text(.13,.005,"Kilde: Kartverket DTM1 · 1 m rutenett · nord opp · 2 × 2 km utsnitt",fontsize=10)
fig.savefig(OUT/"terrain_map.png",dpi=170)
plt.close(fig)

fig, axs = plt.subplots(2,1,figsize=(11,8),layout="constrained")
fig.set_constrained_layout_pads(h_pad=.08, w_pad=.05, rect=(0,.045,1,.955))
for p in profiles:
    axs[0].plot(dist,p["z"],label=p["label"],color=p["color"],lw=1.8)
axs[0].set(title="Terrengprofiler gjennom det oppgitte punktet",xlim=(-500,500),
           ylabel="Høyde (m NN2000)",xlabel="Avstand fra punktet langs profilen (m)")
axs[0].legend(ncols=3,loc="upper right")
north=profiles[0]
axs[1].plot(dist,north["z"],color=north["color"],lw=2.2)
axs[1].fill_between(dist,north["z"],0,color=north["color"],alpha=.08)
axs[1].scatter([0],[point_height],color="#b92038",zorder=5)
axs[1].annotate(f"Punktet: {point_height:.1f} m",(0,point_height),xytext=(12,350),
                arrowprops={"arrowstyle":"-","color":"#b92038"},color="#8b1024")
axs[1].set(title="Nærbilde av nord–sør-profilen · negativ avstand = sør",xlim=(-50,100),
           ylim=(100,390),ylabel="Høyde (m NN2000)",xlabel="Avstand fra punktet mot rutenettnord (m)")
for ax in axs:
    ax.axvline(0,color="#b92038",ls=":",lw=1)
    ax.grid(alpha=.2)
fig.text(.10,.005,"Kilde: Kartverket DTM1 · bilineær prøvetaking hver meter · ingen identifisert topp/fot av veggen",fontsize=10)
fig.savefig(OUT/"height_profiles.png",dpi=170)
plt.close(fig)

# The local 3D surface uses a 2 m display mesh. The exported GeoTIFF stays at 1 m.
cols=np.arange(500,1500,2)
rows=np.arange(500,1500,2)
xx=transform.c+(cols+.5)*transform.a-X
yy=transform.f+(rows+.5)*transform.e-Y
zz=z[np.ix_(rows,cols)]
fig=plt.figure(figsize=(12,9),layout="constrained")
ax=fig.add_subplot(projection="3d",computed_zorder=False)
ax.plot_surface(*np.meshgrid(xx,yy),zz,cmap="terrain",norm=norm,rcount=300,ccount=300,
                linewidth=0,antialiased=True,zorder=1)
ax.scatter([0],[0],[point_height+3],color="#b92038",s=60,depthshade=False,zorder=10)
for p in profiles[:1]:
    ax.plot(p["x"]-X,p["y"]-Y,p["z"]+2,color=p["color"],lw=2.5,zorder=5)
ax.set(xlabel="Øst (m)",ylabel="Nord (m)",zlabel="m NN2000",xlim=(-500,500),ylim=(-500,500),
       title="Sørdalen · terrengoverflate rundt punktet\n1 × 1 km · lik skala horisontalt og vertikalt")
ax.set_zlim(0,500)
ax.set_box_aspect((1000,1000,500))
ax.view_init(elev=28,azim=55)
fig.text(.10,.015,"Kartverket DTM1 · 2 m visningsnett · rødt = oppgitt punkt · blått = nord–sør-profil",fontsize=10)
fig.savefig(OUT/"terrain_3d.png",dpi=170)
plt.close(fig)

surface=go.Surface(x=np.round(xx,2).tolist(),y=np.round(yy,2).tolist(),z=np.round(zz,2).tolist(),
                   colorscale="Earth",cmin=0,cmax=610,colorbar={"title":"m NN2000","len":.7},
                   hovertemplate="Øst: %{x:.0f} m<br>Nord: %{y:.0f} m<br>Høyde: %{z:.1f} m NN2000<extra></extra>")
interactive=go.Figure(surface)
interactive.add_trace(go.Scatter3d(x=[0],y=[0],z=[point_height+2],mode="markers+text",
                      marker={"color":"crimson","size":5},text=["Oppgitt punkt"],
                      name="Oppgitt punkt",hovertemplate=f"{LAT}° N, {LON}° E<br>{point_height:.1f} m NN2000<extra></extra>"))
interactive.add_trace(go.Scatter3d(x=(north["x"]-X).tolist(),y=(north["y"]-Y).tolist(),
                      z=(north["z"]+1).tolist(),mode="lines",line={"color":"#00b5e2","width":5},
                      name="Sør → nord",hoverinfo="skip"))
interactive.update_layout(title={"text":"Sørdalen, Flakstad · Kartverket DTM1<br><sup>1 × 1 km · 2 m visningsnett · terrenghøyder NN2000 · ingen vertikal overdrivelse</sup>","x":.04},
    scene={"xaxis":{"title":"Øst for punktet (m)"},"yaxis":{"title":"Nord for punktet (m)"},
           "zaxis":{"title":"Høyde (m NN2000)"},"aspectmode":"data",
           "camera":{"eye":{"x":1.3,"y":1.5,"z":.8}}},
    margin={"t":90,"b":65,"l":10,"r":10},height=800,
    legend={"orientation":"h","y":0},
    annotations=[{"text":"Kartverket DTM1 · NDH Lofoten 2pkt 2017 · NLOD 2.0<br>Terrengmodell med én høyde per celle; overheng vises ikke.",
                  "xref":"paper","yref":"paper","x":0,"y":-.06,"showarrow":False,"font":{"size":11}}])
interactive.write_html(OUT/"terrain_3d.html",include_plotlyjs=True,full_html=True,
                       config={"responsive":True,"displaylogo":False},div_id="sordalen-terrain")

source_hash = hashlib.sha256(raw.read_bytes()).hexdigest() if raw.exists() else None
summary={"target":{"latitude":LAT,"longitude":LON,"easting":X,"northing":Y},
         "horizontal_crs":"EPSG:25833", "vertical_crs":f"EPSG:5941 ({CRS(5941).name})",
         "source":"https://nedlasting.geonorge.no/hoydedata/DTM1/33-135-175.tif",
         "retrieved_local_date":"2026-11-05", "source_bytes":raw.stat().st_size if raw.exists() else None,
         "source_sha256":source_hash,"crop":{"bounds":list(bounds),"shape":list(z.shape),
         "resolution_m":1,"valid_fraction":1.0,"min_height_m":float(z.min()),"max_height_m":float(z.max())},
         "point_height_bilinear_m_nn2000":point_height,"point_height_nearest_cell_m_nn2000":point_nearest,
         "north_profile_slope_0_to_20m_deg":float(np.degrees(np.arctan2(sample(X,Y)-sample(X,Y+20),20))),
         "north_profile_slope_5_to_15m_deg":float(np.degrees(np.arctan2(sample(X,Y+5)-sample(X,Y+15),10))),
         "north_profile_samples":[{"distance_m":d,"height_nn2000_m":float(sample(X,Y+d))} for d in (0,5,10,15,20,30,50,100,200,300)],
         "cliff_height":"Not determined: top and foot have not been independently identified.",
         "limitations":["DTM is a 2.5D ground surface; overhangs and vertical walls are not fully resolved.",
                         "Grid spacing is not a statement of vertical accuracy.",
                         "Profiles follow grid azimuths, not surveyed climb lines.",
                         "Lidar point density in project metadata is specified density, not local verified density."]}
(META/"analysis_summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2))
print(json.dumps(summary,ensure_ascii=False,indent=2))
