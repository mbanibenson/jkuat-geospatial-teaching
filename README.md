# JKUAT geospatial units — readers and data

Course readers and datasets for three undergraduate units in the Department of
Geomatic Engineering and Geospatial Information Systems, JKUAT.

| unit | | |
|---|---|---|
| **EGS 2405** | Geostatistics | scikit-gstat, PyKrige, GeoPandas |
| **EGS 2403** | Remote Sensing Applications | Google Earth Engine, QGIS |
| **EGE 2531** | Web Mapping | Leaflet, PostGIS, GeoServer, Flask |

**<https://mbanibenson.github.io/jkuat-geospatial-teaching/>**

Each unit's reader is a single self-contained HTML page — open it in any
browser, online or off.

## Getting the data

Each unit has a zip containing everything it needs:

```
egs2405/egs2405-data.zip
egs2403/egs2403-data.zip     (includes interpret.py)
ege2531/ege2531-data.zip
```

About 9 MB in total. Download once and the units work offline — with one
exception: **EGS 2403 week 6 needs a connection**. Reference labels for your
accuracy assessment come from the interpretation server, using a token issued
to you individually:

```
python interpret.py --server https://SERVER --token XXXX-XXXX-XXXX --save
python interpret.py --points my_sample.csv --out interpreted.csv
```

The payload is small — a few hundred points — so a phone tether is ample. Ask
your lecturer for the address and your token.

## About the datasets

The soil samples, the land-cover map and the facility register are
**synthetic**. A simulated field has a known variogram and a simulated register
has known faults, so your work can be marked against the answer rather than
against an opinion.

County boundaries are real —
[geoBoundaries](https://www.geoboundaries.org/) ADM1, public domain — because
real polygons have holes, slivers and thousands of vertices, and none of that
survives being invented.

The datasets are regenerated with a new seed each year.

## Reuse

Readers and generated data may be reused and adapted for teaching with
attribution. County boundaries are public domain.

Corrections are welcome. An error you find in a reader is worth finding.
