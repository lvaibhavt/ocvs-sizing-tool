# OCVS Sizing Tool

## â–¶ Open the tool: **https://lvaibhavt.github.io/ocvs-sizing-tool/**

Three layouts, same inputs and numbers (switch at the top of the page):
- **View 1 Â· Cards** (default): https://lvaibhavt.github.io/ocvs-sizing-tool/
- **View 2 Â· Table** (navy/gold comparison table, like VMware Cloud Pricing Compare): https://lvaibhavt.github.io/ocvs-sizing-tool/?view=2
- **View 3 Â· Summary**: View 2 with a **Basic / Detailed** switch. Basic shows the region, recommended configuration, node count and what it is sized by, total cores / RAM and usable storage, per-node, storage, monthly, 12-month and term price, and the savings with OCVS; Detailed is the full View 2. **Download PPT** follows the switch (single-cluster and consolidated decks): https://lvaibhavt.github.io/ocvs-sizing-tool/?view=3

This tool sizes a VMware workload by host shape across four clouds:

- **Oracle Cloud VMware Solution (OCVS)**
- **Azure VMware Solution (AVS)**
- **Google Cloud VMware Engine (GCVE)**
- **Amazon Elastic VMware Service (EVS)**

It sizes every host shape, prices it, and recommends the cheapest fit on each cloud.

Prices come **directly from each vendor**, not from other tools:

| Cloud | Hosts | Storage |
|---|---|---|
| OCVS | Oracle OCVS pricing reference (monthly per node at 744 hours, on-demand / 1-year / 3-year), kept in `OCVS_REFERENCE` in `tools/fetch_prices.py` | Block Volume, File Storage ([Oracle Cloud price list API](https://apexapps.oracle.com/pls/apex/cetools/api/v1/products/)) |
| AVS | [Azure Retail Prices API](https://prices.azure.com/api/retail/prices) (VCF BYOL, all regions) | Elastic SAN, Azure NetApp Files (same API) |
| GCVE | [VMware Engine pricing page](https://cloud.google.com/vmware-engine/pricing) (every region's table) | Storage-only nodes (same page), [NetApp Volumes](https://cloud.google.com/netapp/volumes/pricing), [Filestore](https://cloud.google.com/filestore/pricing) |
| Amazon EVS | [AWS Price List](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEVS/current/region_index.json) (EVS fee) + AWS pricing-page data (EC2 on-demand, EC2 Instance Savings Plans, Dedicated Host) | FSx for NetApp ONTAP (AWS Price List) |

### Refreshing prices

```bash
python tools/fetch_prices.py
```

This rewrites `data/prices.js` (a few minutes; no credentials needed). Commit the file and the site updates. Host specs, regions and storage documentation live in `data/catalog.js`.

**OCVS host prices** come from Oracle's OCVS pricing reference (e.g. BM.DenseIO.E4.128: $7,142.40 on-demand, $4,642.56 1-year, $3,571.20 3-year per node per month at 744 hours). The public price-list API's per-OCPU OCVS SKUs don't match that reference, so they aren't used for hosts. When Oracle updates OCVS pricing, edit `OCVS_REFERENCE` and re-run the script.

## Simple by default, advanced when you need it

Out of the box the tool uses the basics: **3-year commitment with monthly payments, 744 hours per month, Frankfurt, 4x vCPU/core overcommit, 1x RAM overcommit (none), vSAN RAID-5**, with no growth buffer, HA spare host, free-space headroom or RAM reservation, and the **base additional storage** on each cloud (the cheapest option that suits running VMs), used only when it costs less than adding vSAN hosts:

| Cloud | Default additional storage (Frankfurt) |
|---|---|
| OCVS | OCI Block Volume Â· Balanced (10 VPU) |
| AVS | Azure Elastic SAN Â· Premium LRS |
| GCVE | Cheapest of Google Cloud NetApp Volumes Standard and storage-only vSAN nodes |
| Amazon EVS | FSx for NetApp ONTAP Â· Single-AZ SSD |

Switch on **Advanced configuration** to change the commitment, hours, regions, sizing assumptions, the storage option per cloud, and a **discount %** per cloud (taken off the whole price: hosts and additional storage) (every tier, e.g. OCI 20/30/40/50 VPU). Each storage option shows its protocol, media, size limits, price, IOPS and throughput per TiB, per-volume maximums, notes and documentation links. Switching Advanced off goes back to the defaults; your advanced values come back when you switch it on again.

**Download PPT** (both views) builds a comparison slide and an assumptions & sources slide in the same style as VMware Cloud Pricing Compare.

## More than one cluster (optional)

Switch on **Add workload clusters** and choose how many (1 to 14; with the management cluster that is the 15 clusters OCVS allows in an SDDC). A tab appears for the **Management cluster** and for each workload cluster. Each tab has its own input (numbers or RVTools report), its own results and its own shape picks. Pricing, regions, storage option, discount and sizing assumptions are shared by all clusters.

- **Name a workload cluster** (for example Production, Non-production, Oracle databases) in the box under the tabs. The name is shown with the cluster's number, for example "Test cluster (workload cluster 1)", in the page headings, the consolidated table and every PowerPoint slide for that cluster, including **Download PPT (this cluster)**. The assumptions slide lists every cluster by number and name.
- **Download PPT (this cluster)** gives the deck for the cluster you are looking at.
- **Download consolidated PPT** gives one slide per cluster, then all clusters together (each cluster's configuration and monthly cost, total nodes, cores and RAM, and the consolidated monthly and term price), then assumptions and sources. With many clusters the list of clusters moves to its own "Cluster breakdown" slides. It follows the style of the current view.
- The page also shows a **Consolidated** table under the results.
- Reducing the number of clusters hides the extra ones without clearing them; raising it again brings them back.

With the switch off, the tool works as a single-cluster tool.

## OCVS only (optional)

Switch on **OCVS only (no comparison)** to size and price Oracle Cloud VMware Solution on its own. The other clouds disappear from the results, the settings, the consolidated table and the PowerPoint decks. It works with one cluster or with the workload cluster switched on.

## Help on every setting

Under **Advanced configuration**, each setting has an **i** button with a short explanation and a worked example (for instance: a 30% growth buffer turns 800 vCPU, 4,096 GB and 60 TB into 1,040 vCPU, 5,325 GB and 78 TB). vSAN policy, free-space headroom and dedup/compression apply to vSAN only; additional storage such as OCI Block Volume is sized at the capacity needed.

## How to use it

1. Choose one input method:
   - **Upload an RVTools report** (`.xlsx`). The tool reads the `vInfo` sheet and totals vCPU, RAM and storage. You can include only powered-on VMs, and use either in-use or provisioned storage. The file stays in your browser.
   - **Enter the numbers manually**: total vCPU, RAM (GB) and storage (TB).
2. Choose the commitment (3-year by default), hours per month (744), and for each cloud the region and, if you want it, an additional storage option.
3. Optionally, adjust the sizing assumptions: vCPU:core ratio, growth, N+1 HA, vSAN policy, slack and dedup.
4. Click **Size and price it**.

## What you get

- **Workload profile**: CPU-heavy, memory-heavy, storage-heavy or balanced.
- **Cheapest shape and host count for each cloud**, with monthly, annual and term cost, and the difference against OCVS, plus the resulting cores, RAM and usable vSAN capacity.
- **Sizing driver**: CPU, RAM, storage or minimum cluster size.
- **Storage-heavy workloads**: when it is cheaper, hosts are sized for compute only and the rest of the storage (in TB, with its monthly cost) goes on external storage. That's OCI Block Volume, Azure NetApp Files or Elastic SAN, Google Cloud NetApp Volumes, or FSx for NetApp ONTAP.
- **A table of every shape**, so you can see the trade-offs.

## Sizing logic

- Compute hosts = max(vCPU Ã· (cores Ã— ratio), RAM Ã· usable host RAM), rounded up, plus HA spares.
- Storage hosts = storage Ã· (raw TB Ã— (1 âˆ’ slack) Ã· policy factor Ã— dedup), rounded up. If the cluster is too small for RAID-5 or RAID-6, RAID-1 is used instead.
- Hosts = max(compute hosts, storage hosts, provider minimum). The minimum is 3 hosts on OCVS, AVS and GCVE, and 4 on EVS.
- **Additional storage is an explicit choice per cloud** (Pricing toggle). The default is *None*: all storage on vSAN, adding hosts until it fits.
- If you pick an option (OCI Block Volume, Azure Elastic SAN or NetApp Files, Google NetApp Volumes or Filestore, Amazon FSx for ONTAP, or **GCVE storage-only vSAN nodes**), hosts are sized for compute and the rest of the storage goes there, at the capacity needed (free-space headroom is a vSAN setting and is not added to it).
- GCVE storage-only nodes match the ve2 size class (e.g. `ve2-mega-so` with `ve2-mega-*`), are at most 50% of the cluster, and use the same commitment term as the hosts.
- Shapes with no local vSAN (such as OCVS Standard shapes) are only sized when additional storage is chosen.
- The recommended shape per cloud is the cheapest total. Shapes without a published price for the region and commitment are skipped.
- Pricing is BYOL. It excludes VCF licences, networking, egress, backup, support, taxes and FSx throughput capacity. External storage is pay-as-you-go.

## Host shapes

Host shapes and specs are in `data/catalog.js`; prices in `data/prices.js`. GPU shapes are excluded.

It's a static single-page app with no backend, hosted on GitHub Pages.

## Confluence edition

A self-contained version for an internal Confluence (Data Center) page, with no internet dependencies (the Excel reader, PowerPoint library, catalog and prices are all inside one file):

```bash
python tools/build_confluence.py
```

This writes `dist/confluence/` (not stored in the repo; build it when you need it):
- `ocvs-sizer-tool.js`: attach it to the Confluence page.
- `confluence-macro.html`: paste its contents into an **HTML** macro on that page.
- `preview.html`: local preview that mimics Confluence.

The tool renders in its own shadow root, so Confluence styles don't affect it. To update prices on Confluence: run `tools/fetch_prices.py`, rebuild, and upload the new `ocvs-sizer-tool.js` to the page (Confluence keeps the old versions as attachment history).
