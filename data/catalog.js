// Static catalog: host shapes and hardware specs, OCVS regions, and storage-option documentation
// (protocol, media, limits, performance, notes, links). No prices here: those come from each vendor
// via tools/fetch_prices.py into data/prices.js.
//
// Specs are from the vendors' documentation:
//   OCVS  https://docs.oracle.com/en-us/iaas/Content/VMware/Concepts/ocvsoverview.htm
//   AVS   https://learn.microsoft.com/en-us/azure/azure-vmware/introduction
//   GCVE  https://cloud.google.com/vmware-engine/docs/concepts-node-types
//   EVS   https://aws.amazon.com/evs/faqs/ and https://aws.amazon.com/ec2/instance-types/i4i/
window.CATALOG = {
  providers: {
    ocvs: {
      name: "OCVS", longName: "Oracle Cloud VMware Solution", defaultRegion: "eu-frankfurt-1", minNodes: 3,
      source: "Oracle OCVS pricing reference (monthly per node at 744 hours; 1-year and 3-year commitment discounts)",
      shapes: [
        { id: "BM.DenseIO2.52", cores: 52, memory: "768 GB", storage: "51.2 TB NVMe (vSAN)" },
        { id: "BM.DenseIO.E4.128", cores: 128, memory: "2,048 GB", storage: "54.4 TB NVMe (vSAN)" },
        { id: "BM.DenseIO.E5.128", cores: 128, memory: "1,536 GB", storage: "81.6 TB NVMe (vSAN)" },
        { id: "BM.Standard2.52", cores: 52, memory: "768 GB", storage: "Block Volume" },
        { id: "BM.Standard3.64", cores: 64, memory: "1,024 GB", storage: "Block Volume" },
        { id: "BM.Standard.E4.128", cores: 128, memory: "2,048 GB", storage: "Block Volume" },
        { id: "BM.Standard.E5.192", cores: 192, memory: "2,304 GB", storage: "Block Volume" },
        { id: "BM.Optimized3.36", cores: 36, memory: "512 GB", storage: "Block Volume" }
      ]
    },
    avs: {
      name: "AVS", longName: "Azure VMware Solution", defaultRegion: "germanywestcentral", minNodes: 3,
      source: "Azure Retail Prices API (prices.azure.com), VCF BYOL",
      shapes: [
        { id: "AV64", cores: 64, memory: "1,024 GB", storage: "19.2 TB NVMe (vSAN)" },
        { id: "AV48", cores: 48, memory: "1,024 GB", storage: "25.6 TB NVMe (vSAN)" },
        { id: "AV52", cores: 52, memory: "1,536 GB", storage: "40.0 TB NVMe (vSAN)" },
        { id: "AV36P", cores: 36, memory: "768 GB", storage: "20.7 TB NVMe (vSAN)" },
        { id: "AV36", cores: 36, memory: "576 GB", storage: "18.6 TB (vSAN)" }
      ]
    },
    gcve: {
      name: "GCVE", longName: "Google Cloud VMware Engine", defaultRegion: "europe-west3", minNodes: 3,
      source: "cloud.google.com/vmware-engine/pricing (per-region tables)",
      shapes: [
        ...["mega", "large", "standard", "small"].flatMap(cls => [128, 112, 96, 80, 64].map(v => ({
          id: `ve2-${cls}-${v}`, cores: v / 2, memory: "2,048 GiB",
          storage: { mega: "51.2 TB", large: "38.4 TB", standard: "25.5 TB", small: "12.8 TB" }[cls] + " NVMe (vSAN)"
        }))),
        { id: "ve1-standard-72", cores: 36, memory: "768 GiB", storage: "19.2 TB (vSAN)" }
      ]
    },
    evs: {
      name: "Amazon EVS", shortName: "EVS", longName: "Amazon Elastic VMware Service", defaultRegion: "eu-central-1", minNodes: 4,
      source: "AWS Price List (AmazonEVS, AmazonFSx) and aws.amazon.com pricing data (EC2 on-demand, EC2 Instance Savings Plans, Dedicated Host)",
      shapes: [
        { id: "i4i.metal", cores: 64, memory: "1,024 GiB", storage: "30 TB NVMe (vSAN)" },
        { id: "i7i.metal-24xl", cores: 48, memory: "768 GiB", storage: "22.5 TB NVMe (vSAN)" }
      ]
    }
  },
  ocvsRegions: [{"id":"ap-sydney-1","name":"Australia East (Sydney) ap-sydney-1"},{"id":"ap-melbourne-1","name":"Australia Southeast (Melbourne) ap-melbourne-1"},{"id":"sa-saopaulo-1","name":"Brazil East (Sao Paulo) sa-saopaulo-1"},{"id":"sa-vinhedo-1","name":"Brazil Southeast (Vinhedo) sa-vinhedo-1"},{"id":"ca-montreal-1","name":"Canada Southeast (Montreal) ca-montreal-1"},{"id":"ca-toronto-1","name":"Canada Southeast (Toronto) ca-toronto-1"},{"id":"sa-santiago-1","name":"Chile Central (Santiago) sa-santiago-1"},{"id":"sa-valparaiso-1","name":"Chile West (Valparaiso) sa-valparaiso-1"},{"id":"sa-bogota-1","name":"Colombia Central (Bogota) sa-bogota-1"},{"id":"eu-paris-1","name":"France Central (Paris) eu-paris-1"},{"id":"eu-marseille-1","name":"France South (Marseille) eu-marseille-1"},{"id":"eu-frankfurt-1","name":"Germany Central (Frankfurt) eu-frankfurt-1"},{"id":"ap-hyderabad-1","name":"India South (Hyderabad) ap-hyderabad-1"},{"id":"ap-mumbai-1","name":"India West (Mumbai) ap-mumbai-1"},{"id":"ap-batam-1","name":"Indonesia North (Batam) ap-batam-1"},{"id":"il-jerusalem-1","name":"Israel Central (Jerusalem) il-jerusalem-1"},{"id":"eu-milan-1","name":"Italy Northwest (Milan) eu-milan-1"},{"id":"eu-turin-1","name":"Italy North (Turin) eu-turin-1"},{"id":"ap-osaka-1","name":"Japan Central (Osaka) ap-osaka-1"},{"id":"ap-tokyo-1","name":"Japan East (Tokyo) ap-tokyo-1"},{"id":"ap-kulai-2","name":"Malaysia West 2 (Kulai) ap-kulai-2"},{"id":"mx-queretaro-1","name":"Mexico Central (Queretaro) mx-queretaro-1"},{"id":"mx-monterrey-1","name":"Mexico Northeast (Monterrey) mx-monterrey-1"},{"id":"af-casablanca-1","name":"Morocco West (Casablanca) af-casablanca-1"},{"id":"eu-amsterdam-1","name":"Netherlands Northwest (Amsterdam) eu-amsterdam-1"},{"id":"me-riyadh-1","name":"Saudi Arabia Central (Riyadh) me-riyadh-1"},{"id":"me-jeddah-1","name":"Saudi Arabia West (Jeddah) me-jeddah-1"},{"id":"ap-singapore-1","name":"Singapore (Singapore) ap-singapore-1"},{"id":"ap-singapore-2","name":"Singapore West (Singapore) ap-singapore-2"},{"id":"af-johannesburg-1","name":"South Africa Central (Johannesburg) af-johannesburg-1"},{"id":"ap-seoul-1","name":"South Korea Central (Seoul) ap-seoul-1"},{"id":"ap-chuncheon-1","name":"South Korea North (Chuncheon) ap-chuncheon-1"},{"id":"eu-madrid-1","name":"Spain Central (Madrid) eu-madrid-1"},{"id":"eu-madrid-3","name":"Spain Central (Madrid 3) eu-madrid-3"},{"id":"eu-stockholm-1","name":"Sweden Central (Stockholm) eu-stockholm-1"},{"id":"eu-zurich-1","name":"Switzerland North (Zurich) eu-zurich-1"},{"id":"me-abudhabi-1","name":"UAE Central (Abu Dhabi) me-abudhabi-1"},{"id":"me-dubai-1","name":"UAE East (Dubai) me-dubai-1"},{"id":"uk-london-1","name":"UK South (London) uk-london-1"},{"id":"uk-cardiff-1","name":"UK West (Newport) uk-cardiff-1"},{"id":"us-ashburn-1","name":"US East (Ashburn) us-ashburn-1"},{"id":"us-chicago-1","name":"US Midwest (Chicago) us-chicago-1"},{"id":"us-phoenix-1","name":"US West (Phoenix) us-phoenix-1"},{"id":"us-sanjose-1","name":"US West (San Jose) us-sanjose-1"}],
  storageOptions: [
 {
  "id": "oci-block",
  "platform": "ocvs",
  "kind": "block",
  "name": "OCI Block Volume",
  "protocol": "iSCSI",
  "datastore": "VMFS",
  "media": "NVMe SSD",
  "ownership": "Oracle first-party",
  "unit": "GB",
  "scaling": "Scales per volume",
  "capScope": "per volume",
  "unitLabel": "volume",
  "unitMaxTiB": 32,
  "maxUnits": 32,
  "minSize": "50 GB",
  "maxSize": "32 TB per volume",
  "tiers": [
   {
    "desc": "Cheapest level. Suited to backups, archives and large sequential reads, not to running VMs.",
    "id": "0",
    "label": "Lower Cost (0 VPU)",
    "iopsPerGB": 2,
    "kbpsPerGB": 240,
    "iopsPerTiB": 2048,
    "mbpsPerTiB": 240,
    "capIops": 3000,
    "capMbps": 480
   },
   {
    "desc": "The default. Good for most VMware workloads — general-purpose VMs, app and web servers.",
    "id": "10",
    "label": "Balanced (10 VPU)",
    "iopsPerGB": 60,
    "kbpsPerGB": 480,
    "iopsPerTiB": 61440,
    "mbpsPerTiB": 480,
    "capIops": 25000,
    "capMbps": 480,
    "default": true
   },
   {
    "desc": "For I/O-heavy workloads such as databases, doubling the per-volume maximum of Balanced.",
    "id": "20",
    "label": "Higher Performance (20 VPU)",
    "iopsPerGB": 75,
    "kbpsPerGB": 600,
    "iopsPerTiB": 76800,
    "mbpsPerTiB": 600,
    "capIops": 50000,
    "capMbps": 680
   },
   {
    "desc": "Ultra High Performance, entry level. For demanding, latency-sensitive workloads. Needs a multipath-enabled attachment.",
    "id": "30",
    "label": "Ultra High (30 VPU)",
    "iopsPerGB": 90,
    "kbpsPerGB": 720,
    "iopsPerTiB": 92160,
    "mbpsPerTiB": 720,
    "capIops": 75000,
    "capMbps": 880
   },
   {
    "desc": "Ultra High Performance at 40 VPU: 105 IOPS/GB, up to 100,000 IOPS and 1,080 MB/s per volume (reached at 952 GB). Needs a multipath-enabled attachment.",
    "id": "40",
    "label": "Ultra High (40 VPU)",
    "iopsPerGB": 105,
    "kbpsPerGB": 840,
    "iopsPerTiB": 107520,
    "mbpsPerTiB": 840,
    "capIops": 100000,
    "capMbps": 1080
   },
   {
    "desc": "Ultra High Performance at 50 VPU: 120 IOPS/GB, up to 125,000 IOPS and 1,280 MB/s per volume (reached at 1,042 GB). Needs a multipath-enabled attachment.",
    "id": "50",
    "label": "Ultra High (50 VPU)",
    "iopsPerGB": 120,
    "kbpsPerGB": 960,
    "iopsPerTiB": 122880,
    "mbpsPerTiB": 960,
    "capIops": 125000,
    "capMbps": 1280
   }
  ],
  "notes": [
   "Balanced: 60 IOPS and 480 KB/s per GB, up to 25,000 IOPS and 480 MB/s per volume — the same figures as the OCI cost estimator.",
   "Higher levels raise the maximum per volume: 50,000 IOPS at Higher Performance (20 VPU); 75,000 / 100,000 / 125,000 IOPS at Ultra High 30 / 40 / 50 VPU. Oracle's table goes up to 120 VPU (300,000 IOPS).",
   "Each VPU adds $0.0017 per GB per month to the $0.0255 storage price: 40 VPU = $0.0935, 50 VPU = $0.1105 per GB.",
   "Ultra High Performance volumes (30 VPU and above) need a multipath-enabled attachment.",
   "The performance level can be changed online, with no downtime."
  ],
  "links": [
   [
    "OCI price list",
    "https://www.oracle.com/cloud/price-list/#block-volume"
   ],
   [
    "Performance levels",
    "https://docs.oracle.com/en-us/iaas/Content/Block/Concepts/blockvolumeperformance.htm"
   ],
   [
    "OCVS datastore management",
    "https://docs.oracle.com/en-us/iaas/Content/VMware/Tasks/datastores.htm"
   ]
  ]
 },
 {
  "id": "elastic-san",
  "platform": "avs",
  "kind": "block",
  "name": "Azure Elastic SAN",
  "protocol": "iSCSI",
  "datastore": "VMFS",
  "media": "SSD",
  "ownership": "Azure first-party",
  "unit": "GiB",
  "scaling": "Scales per SAN, from base capacity only",
  "capScope": "per volume",
  "unitLabel": "volume",
  "unitMaxTiB": 64,
  "serviceMaxIops": 2000000,
  "serviceMaxMbps": 80000,
  "serviceMaxBaseTiB": 400,
  "minSize": "16 TiB base capacity (AVS requirement)",
  "maxSize": "64 TiB per volume",
  "tiers": [
   {
    "desc": "Base capacity = storage that also buys performance (5,000 IOPS and 200 MB/s per TiB). LRS keeps 3 copies inside one datacenter.",
    "id": "lrs",
    "label": "Premium LRS — base capacity",
    "iopsPerTiB": 5000,
    "mbpsPerTiB": 200,
    "capIops": 80000,
    "capMbps": 1280,
    "default": true
   },
   {
    "desc": "Additional capacity = storage only, no extra performance, 25% cheaper. Used to add space once base capacity gives enough IOPS. LRS: 3 copies in one datacenter.",
    "id": "lrs-add",
    "label": "Premium LRS — additional capacity",
    "iopsPerTiB": 0,
    "mbpsPerTiB": 0,
    "capIops": 0,
    "capMbps": 0
   },
   {
    "desc": "Same as base capacity, but ZRS keeps 3 copies across 3 availability zones, so it survives a zone outage. Costs about 64% more than LRS.",
    "id": "zrs",
    "label": "Premium ZRS — base capacity",
    "iopsPerTiB": 5000,
    "mbpsPerTiB": 200,
    "capIops": 80000,
    "capMbps": 1280
   },
   {
    "desc": "ZRS storage-only capacity: 3 copies across 3 zones, no extra performance, cheaper than ZRS base.",
    "id": "zrs-add",
    "label": "Premium ZRS — additional capacity",
    "iopsPerTiB": 0,
    "mbpsPerTiB": 0,
    "capIops": 0,
    "capMbps": 0
   }
  ],
  "notes": [
   "Only base capacity adds performance: 5,000 IOPS and 200 MB/s per TiB. Additional capacity adds none and costs 25% less.",
   "SAN performance is shared across all volumes; one volume tops out at 80,000 IOPS / 1,280 MB/s.",
   "For AVS, Microsoft requires an Elastic SAN with at least 16 TiB of base capacity, in the same region and availability zone as the private cloud."
  ],
  "links": [
   [
    "AVS + Elastic SAN",
    "https://learn.microsoft.com/en-us/azure/azure-vmware/configure-azure-elastic-san"
   ],
   [
    "Scale targets",
    "https://learn.microsoft.com/en-us/azure/storage/elastic-san/elastic-san-scale-targets"
   ],
   [
    "Azure pricing calculator",
    "https://azure.microsoft.com/en-us/pricing/calculator/"
   ]
  ]
 },
 {
  "id": "fsx-block",
  "platform": "evs",
  "kind": "block",
  "name": "Amazon FSx for NetApp ONTAP",
  "protocol": "iSCSI / NVMe",
  "datastore": "VMFS",
  "media": "SSD (+ optional cold tier)",
  "ownership": "AWS first-party — NetApp ONTAP",
  "unit": "GB",
  "scaling": "Scales per file system, capped by throughput capacity",
  "capScope": "per file system",
  "unitLabel": "file system",
  "unitMaxTiB": 192,
  "minSize": "1,024 GiB SSD",
  "maxSize": "192 TiB SSD per HA pair",
  "tiers": [
   {
    "desc": "File system and its standby both in one availability zone. The lower-cost choice.",
    "id": "single",
    "label": "Single-AZ SSD",
    "iopsPerTiB": 3072,
    "mbpsPerTiB": 768,
    "capIops": 200000,
    "capMbps": 6144,
    "default": true
   },
   {
    "desc": "Standby copy in a second availability zone, so it survives a zone outage. Twice the Single-AZ price.",
    "id": "multi",
    "label": "Multi-AZ SSD",
    "iopsPerTiB": 3072,
    "mbpsPerTiB": 768,
    "capIops": 200000,
    "capMbps": 6144
   },
   {
    "desc": "Low-cost cold tier. ONTAP moves rarely used data here automatically. Tens of milliseconds of latency, so not for active VMs.",
    "id": "pool",
    "label": "Capacity pool (cold tier)",
    "iopsPerTiB": 0,
    "mbpsPerTiB": 0,
    "pool": true
   }
  ],
  "notes": [
   "SSD defaults to 3,072 IOPS and 768 MB/s per TiB, both capped by the throughput capacity bought for the file system.",
   "Throughput capacity is charged per MBps-month and is included in the price (default 128 MBps, the smallest file system; change it on the card).",
   "The AWS calculator pre-fills 65% savings from compression and deduplication and bills only the remaining capacity. The tool defaults to 0% so all four services are compared on provisioned capacity; enter 65 to reproduce the AWS calculator.",
   "Extra SSD IOPS cost $0.0204 (Single-AZ) or $0.0408 (Multi-AZ) per IOPS-month.",
   "Capacity pool is cold, tiered storage: tens of milliseconds of latency instead of sub-millisecond."
  ],
  "links": [
   [
    "FSx for ONTAP with EVS",
    "https://docs.aws.amazon.com/evs/latest/userguide/fsx-ontap.html"
   ],
   [
    "iSCSI datastore setup",
    "https://docs.aws.amazon.com/evs/latest/userguide/config-fsx-iscsi-datastore.html"
   ],
   [
    "Performance",
    "https://docs.aws.amazon.com/fsx/latest/ONTAPGuide/performance.html"
   ],
   [
    "AWS pricing calculator",
    "https://calculator.aws/#/createCalculator/FSxONTAP"
   ]
  ]
 },
 {
  "id": "gcve-so",
  "platform": "gcve",
  "kind": "vsan",
  "name": "Storage-only nodes (vSAN)",
  "protocol": "vSAN (local to the cluster)",
  "datastore": "vSAN",
  "media": "NVMe SSD (local disks)",
  "ownership": "Google first-party",
  "unit": "node",
  "nodeBased": true,
  "scaling": "Adds vSAN capacity to the cluster, no cores or memory",
  "capScope": "per cluster",
  "minSize": "1 node (cluster needs 3 HCI nodes, or 2 in a workload cluster)",
  "maxSize": "Up to 50% of the nodes in a cluster",
  "tiers": [
   {
    "id": "ve2-small-so",
    "label": "ve2-small-so — 12.8 TB raw",
    "rawTB": 12.8,
    "desc": "Smallest storage-only node: 12.8 TB raw. Pairs with ve2-small HCI nodes.",
    "default": true
   },
   {
    "id": "ve2-standard-so",
    "label": "ve2-standard-so — 25.5 TB raw",
    "rawTB": 25.5,
    "desc": "25.5 TB raw per node. Pairs with ve2-standard HCI nodes."
   },
   {
    "id": "ve2-large-so",
    "label": "ve2-large-so — 38.4 TB raw",
    "rawTB": 38.4,
    "desc": "38.4 TB raw per node. Pairs with ve2-large HCI nodes."
   },
   {
    "id": "ve2-mega-so",
    "label": "ve2-mega-so — 51.2 TB raw",
    "rawTB": 51.2,
    "desc": "Largest storage-only node: 51.2 TB raw. Pairs with ve2-mega HCI nodes."
   }
  ],
  "notes": [
   "Storage-only nodes have no customer-usable cores or memory; they only add vSAN capacity to an existing cluster.",
   "A cluster needs at least 3 HCI nodes (management cluster) or 2 (workload cluster) before storage-only nodes can be added, and at most 50% of the cluster can be storage-only.",
   "The node must match the cluster's HCI family and size class (e.g. ve2-small-so with ve2-small-* nodes).",
   "Usable capacity depends on the vSAN storage policy: RAID-1 (FTT=1) keeps two copies (50% usable); RAID-5 (FTT=1) is about 75% usable. VMware also recommends leaving 25–30% free (slack space), which is not deducted here.",
   "The price covers the storage-only nodes only — not the HCI nodes they are added to."
  ],
  "links": [
   [
    "Storage-only nodes",
    "https://docs.cloud.google.com/vmware-engine/docs/concepts-storage-only-nodes"
   ],
   [
    "Use storage-only nodes",
    "https://docs.cloud.google.com/vmware-engine/docs/networking/howto-use-storage-only-nodes"
   ],
   [
    "Node types",
    "https://docs.cloud.google.com/vmware-engine/docs/concepts-node-types"
   ],
   [
    "VMware Engine pricing",
    "https://cloud.google.com/vmware-engine/pricing"
   ]
  ]
 },
 {
  "id": "oci-fss",
  "platform": "ocvs",
  "kind": "file",
  "name": "OCI File Storage (FSS)",
  "protocol": "NFSv3",
  "datastore": "NFS",
  "media": "SSD-backed, 5-way replicated",
  "ownership": "Oracle first-party",
  "unit": "GB",
  "scaling": "Fixed per mount target — does not scale with capacity",
  "capScope": "per mount target",
  "minSize": "No minimum",
  "maxSize": "8 EB per file system",
  "tiers": [
   {
    "desc": "The normal way to mount OCI File Storage. Throughput comes from the mount target, not from how much you store.",
    "id": "std",
    "label": "Standard mount target",
    "fixedMbps": 1250,
    "default": true
   },
   {
    "desc": "High Performance Mount Target: 20 Gbps for the file system. Extra monthly charge, 30-day commitment.",
    "id": "hpmt20",
    "label": "HPMT-20 (20 Gbps)",
    "fixedMbps": 2500,
    "extra": true
   },
   {
    "desc": "High Performance Mount Target: 40 Gbps. Extra monthly charge, 30-day commitment.",
    "id": "hpmt40",
    "label": "HPMT-40 (40 Gbps)",
    "fixedMbps": 5000,
    "extra": true
   },
   {
    "desc": "High Performance Mount Target: 80 Gbps. Extra monthly charge, 30-day commitment.",
    "id": "hpmt80",
    "label": "HPMT-80 (80 Gbps)",
    "fixedMbps": 10000,
    "extra": true
   }
  ],
  "notes": [
   "Performance comes from the mount target, not from provisioned capacity: a 100 GiB share and a 100 TiB share get the same throughput.",
   "High Performance Mount Targets (20/40/80 Gbps) are billed separately per performance unit with a 30-day commitment; that charge is NOT in the price shown.",
   "Scale out with more mount targets — Oracle has demonstrated 1.6M IOPS across four.",
   "VMware-certified as secondary storage for OCVS (March 2022).",
   "For bulk capacity on OCVS, block volume datastores are far cheaper per TiB than FSS."
  ],
  "links": [
   [
    "OCI File Storage is VMware certified",
    "https://blogs.oracle.com/cloud-infrastructure/post/oci-fss-service-is-now-vmware-certified"
   ],
   [
    "OCI price list",
    "https://www.oracle.com/cloud/price-list/#file-storage"
   ],
   [
    "Mount target performance",
    "https://docs.oracle.com/en-us/iaas/Content/File/Tasks/change-mt-performance.htm"
   ]
  ]
 },
 {
  "id": "anf",
  "platform": "avs",
  "kind": "file",
  "name": "Azure NetApp Files",
  "protocol": "NFS",
  "datastore": "NFS",
  "media": "Bare-metal flash (NetApp)",
  "ownership": "Azure first-party",
  "unit": "GiB",
  "scaling": "Scales per volume, with the assigned quota",
  "capScope": "per volume",
  "unitLabel": "volume",
  "unitMaxTiB": 100,
  "minSize": "1 TiB capacity pool",
  "maxSize": "1 PiB pool · 100 TiB large volume",
  "tiers": [
   {
    "desc": "16 MiB/s per TiB. Lowest cost, for capacity-heavy, low-activity data.",
    "id": "standard",
    "label": "Standard",
    "mbpsPerTiB": 16,
    "mib": true,
    "hourly": true
   },
   {
    "desc": "64 MiB/s per TiB. The usual choice for general VMware datastores.",
    "id": "premium",
    "label": "Premium",
    "mbpsPerTiB": 64,
    "mib": true,
    "default": true,
    "hourly": true
   },
   {
    "desc": "128 MiB/s per TiB. For throughput-hungry workloads.",
    "id": "ultra",
    "label": "Ultra",
    "mbpsPerTiB": 128,
    "mib": true,
    "hourly": true
   },
   {
    "desc": "Pay for capacity and throughput separately — useful for big but quiet datastores. Throughput (min 128 MiB/s) is extra.",
    "id": "flexible",
    "label": "Flexible (capacity only)",
    "mbpsPerTiB": 0,
    "mib": true,
    "extra": true,
    "hourly": true
   }
  ],
  "notes": [
   "Throughput follows the service level and the volume quota: 16 / 64 / 128 MiB/s per TiB for Standard / Premium / Ultra.",
   "Microsoft publishes throughput, not IOPS, for the service levels.",
   "Flexible decouples capacity from throughput: minimum 128 MiB/s, then $2.93 per MiB/s per month, not in the price shown."
  ],
  "links": [
   [
    "Attach ANF datastores to AVS",
    "https://learn.microsoft.com/en-us/azure/azure-vmware/attach-azure-netapp-files-to-azure-vmware-solution-hosts"
   ],
   [
    "Service levels",
    "https://learn.microsoft.com/en-us/azure/azure-netapp-files/azure-netapp-files-service-levels"
   ],
   [
    "ANF pricing",
    "https://azure.microsoft.com/en-us/pricing/details/netapp/"
   ]
  ]
 },
 {
  "id": "gcnv",
  "platform": "gcve",
  "kind": "file",
  "name": "Google Cloud NetApp Volumes",
  "protocol": "NFSv3",
  "datastore": "NFS",
  "media": "Not published by Google",
  "ownership": "Google first-party — NetApp",
  "unit": "GiB",
  "scaling": "Scales per volume, with provisioned capacity",
  "capScope": "per storage pool",
  "unitLabel": "volume",
  "unitMaxTiB": 100,
  "minSize": "1 TiB storage pool",
  "maxSize": "Varies by service level",
  "tiers": [
   {
    "desc": "16 KiB/s per GiB (16 MiB/s per TiB). Lowest cost.",
    "id": "standard",
    "label": "Standard",
    "mbpsPerTiB": 16,
    "mib": true,
    "hourly": true
   },
   {
    "desc": "64 KiB/s per GiB (64 MiB/s per TiB). The usual choice for VMware datastores.",
    "id": "premium",
    "label": "Premium",
    "mbpsPerTiB": 64,
    "mib": true,
    "default": true,
    "hourly": true
   },
   {
    "desc": "128 KiB/s per GiB (128 MiB/s per TiB). For the most throughput-hungry workloads.",
    "id": "extreme",
    "label": "Extreme",
    "mbpsPerTiB": 128,
    "mib": true,
    "hourly": true
   }
  ],
  "notes": [
   "Throughput scales with capacity: 16 / 64 / 128 KiB/s per GiB for Standard / Premium / Extreme.",
   "Google publishes throughput, not IOPS, and does not publish the underlying media.",
   "NFSv3 only — NFSv4.1 is not supported as a VMware Engine datastore.",
   "1-year and 3-year committed use discounts exist; the price shown is list."
  ],
  "links": [
   [
    "NetApp Volumes as a GCVE datastore",
    "https://docs.cloud.google.com/vmware-engine/docs/vmware-ecosystem/howto-cloud-volumes-datastores-vmware-engine"
   ],
   [
    "NetApp Volumes pricing",
    "https://cloud.google.com/netapp/volumes/pricing"
   ],
   [
    "Service levels",
    "https://docs.cloud.google.com/netapp/volumes/docs/discover/service-levels"
   ]
  ]
 },
 {
  "id": "filestore",
  "platform": "gcve",
  "kind": "file",
  "name": "Filestore",
  "protocol": "NFSv3",
  "datastore": "NFS",
  "media": "SSD",
  "ownership": "Google first-party",
  "unit": "GiB",
  "scaling": "Scales per instance, with capacity",
  "capScope": "per instance",
  "unitLabel": "instance",
  "unitMaxTiB": 100,
  "minSize": "10 TiB to be VMware-certified",
  "maxSize": "100 TiB per instance",
  "tiers": [
   {
    "desc": "Data kept in one zone. Lower cost; unavailable if that zone fails.",
    "id": "zonal",
    "label": "Zonal",
    "iopsPerTiB": 9200,
    "mbpsPerTiB": 260,
    "mib": true,
    "writeIopsPerTiB": 2600,
    "writeMbpsPerTiB": 88,
    "default": true,
    "hourly": true
   },
   {
    "desc": "Data replicated across zones in the region, so it survives a zone outage. About 80% more than Zonal.",
    "id": "regional",
    "label": "Regional",
    "iopsPerTiB": 9200,
    "mbpsPerTiB": 260,
    "mib": true,
    "writeIopsPerTiB": 2600,
    "writeMbpsPerTiB": 88,
    "hourly": true
   }
  ],
  "notes": [
   "Performance scales with capacity: at 10 TiB, 92,000 read IOPS / 26,000 write IOPS and 2,600 MiB/s read / 880 MiB/s write.",
   "Only Zonal and Regional tiers of 10 TiB or more are VMware-certified; Basic SSD and Basic HDD are not supported.",
   "Custom performance (provisioned IOPS) is billed separately and is not in the price shown.",
   "NFSv3 only."
  ],
  "links": [
   [
    "Filestore volumes as GCVE datastores",
    "https://docs.cloud.google.com/vmware-engine/docs/vmware-ecosystem/howto-filestore-storage-for-vmware-engine-datastores"
   ],
   [
    "Performance",
    "https://docs.cloud.google.com/filestore/docs/performance"
   ],
   [
    "Filestore pricing",
    "https://cloud.google.com/filestore/pricing"
   ]
  ]
 },
 {
  "id": "fsx-file",
  "platform": "evs",
  "kind": "file",
  "name": "Amazon FSx for NetApp ONTAP",
  "protocol": "NFSv3 / NFSv4.1",
  "datastore": "NFS",
  "media": "SSD (+ optional cold tier)",
  "ownership": "AWS first-party — NetApp ONTAP",
  "unit": "GB",
  "scaling": "Scales per file system, capped by throughput capacity",
  "capScope": "per file system",
  "unitLabel": "file system",
  "unitMaxTiB": 192,
  "minSize": "1,024 GiB SSD",
  "maxSize": "192 TiB SSD per HA pair",
  "tiers": [
   {
    "desc": "File system and its standby both in one availability zone. The lower-cost choice.",
    "id": "single",
    "label": "Single-AZ SSD",
    "iopsPerTiB": 3072,
    "mbpsPerTiB": 768,
    "capIops": 200000,
    "capMbps": 6144,
    "default": true
   },
   {
    "desc": "Standby copy in a second availability zone, so it survives a zone outage. Twice the Single-AZ price.",
    "id": "multi",
    "label": "Multi-AZ SSD",
    "iopsPerTiB": 3072,
    "mbpsPerTiB": 768,
    "capIops": 200000,
    "capMbps": 6144
   },
   {
    "desc": "Low-cost cold tier. ONTAP moves rarely used data here automatically. Tens of milliseconds of latency, so not for active VMs.",
    "id": "pool",
    "label": "Capacity pool (cold tier)",
    "iopsPerTiB": 0,
    "mbpsPerTiB": 0,
    "pool": true
   }
  ],
  "notes": [
   "SSD defaults to 3,072 IOPS and 768 MB/s per TiB, both capped by the file system's throughput capacity.",
   "Throughput capacity is charged separately ($0.822 per MB/s per month Single-AZ) and is NOT in the price shown.",
   "The only external datastore AWS documents as validated for EVS, and the only option here supporting NFSv4.1.",
   "Capacity pool is cold, tiered storage with tens of milliseconds of latency."
  ],
  "links": [
   [
    "FSx for ONTAP with EVS",
    "https://docs.aws.amazon.com/evs/latest/userguide/fsx-ontap.html"
   ],
   [
    "NFS datastore setup",
    "https://docs.aws.amazon.com/evs/latest/userguide/config-fsx-nfs-datastore.html"
   ],
   [
    "Performance",
    "https://docs.aws.amazon.com/fsx/latest/ONTAPGuide/performance.html"
   ],
   [
    "FSx pricing",
    "https://aws.amazon.com/fsx/netapp-ontap/pricing/"
   ]
  ]
 }
]
};
